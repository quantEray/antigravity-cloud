import * as crypto from 'crypto';
import * as zlib from 'zlib';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 10000; // Fast & secure 10ms derivation

export interface EncryptedPayload {
  version: number;
  compressed?: boolean;
  salt: string; // hex
  iv: string; // hex
  tag: string; // hex
  data: string; // base64 or hex
}

export function encryptPayload(plaintext: string, password?: string): string {
  const plainBuffer = Buffer.from(plaintext, 'utf-8');

  if (!password) {
    return JSON.stringify({
      version: 1,
      compressed: false,
      unencrypted: true,
      data: plainBuffer.toString('base64'),
    });
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encryptedBuf = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    version: 1,
    compressed: false,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encryptedBuf.toString('base64'),
  };

  return JSON.stringify(payload);
}

export async function encryptPayloadAsync(
  plaintext: string,
  password?: string,
  abortSignal?: AbortSignal
): Promise<string> {
  if (abortSignal?.aborted) throw new Error('Operation canceled by user.');

  const plainBuffer = Buffer.from(plaintext, 'utf-8');

  if (!password) {
    return JSON.stringify({
      version: 1,
      compressed: false,
      unencrypted: true,
      data: plainBuffer.toString('base64'),
    });
  }

  if (abortSignal?.aborted) throw new Error('Operation canceled by user.');

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Non-blocking PBKDF2 calculation off main thread
  const key = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

  if (abortSignal?.aborted) throw new Error('Operation canceled by user.');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encryptedBuf = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    version: 1,
    compressed: false,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encryptedBuf.toString('base64'),
  });
}

export async function decryptPayloadAsync(
  rawPayload: string,
  password?: string
): Promise<string> {
  const parsed = JSON.parse(rawPayload);

  let decryptedBuffer: Buffer;

  if (parsed.unencrypted) {
    decryptedBuffer = Buffer.from(parsed.data, 'base64');
  } else {
    if (!password) {
      throw new Error('Encryption password is required to decrypt cloud backup.');
    }

    const payload = parsed as EncryptedPayload;
    const salt = Buffer.from(payload.salt, 'hex');
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');

    // Handle both base64 and legacy hex encrypted data
    const isHex = /^[0-9a-f]+$/i.test(payload.data) && payload.data.length % 2 === 0;
    const cipherData = isHex ? Buffer.from(payload.data, 'hex') : Buffer.from(payload.data, 'base64');

    // Non-blocking PBKDF2 calculation
    const key = await new Promise<Buffer>((resolve, reject) => {
      // Try with current iteration count
      crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });

    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      decryptedBuffer = Buffer.concat([decipher.update(cipherData), decipher.final()]);
    } catch {
      // Fallback for legacy 100,000 iteration backups
      const legacyKey = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, KEY_LENGTH, 'sha256', (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        });
      });
      const decipher = crypto.createDecipheriv(ALGORITHM, legacyKey, iv);
      decipher.setAuthTag(tag);
      decryptedBuffer = Buffer.concat([decipher.update(cipherData), decipher.final()]);
    }
  }

  // Handle legacy outer gzip compression if present
  if (parsed.compressed) {
    const decompressed = await new Promise<Buffer>((resolve, reject) => {
      zlib.gunzip(decryptedBuffer, (err, res) => (err ? reject(err) : resolve(res)));
    });
    return decompressed.toString('utf-8');
  }

  return decryptedBuffer.toString('utf-8');
}

export function decryptPayload(rawPayload: string, password?: string): string {
  const parsed = JSON.parse(rawPayload);

  let decryptedBuffer: Buffer;

  if (parsed.unencrypted) {
    decryptedBuffer = Buffer.from(parsed.data, 'base64');
  } else {
    if (!password) {
      throw new Error('Encryption password is required to decrypt cloud backup.');
    }

    const payload = parsed as EncryptedPayload;
    const salt = Buffer.from(payload.salt, 'hex');
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');

    const isHex = /^[0-9a-f]+$/i.test(payload.data) && payload.data.length % 2 === 0;
    const cipherData = isHex ? Buffer.from(payload.data, 'hex') : Buffer.from(payload.data, 'base64');

    let key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      decryptedBuffer = Buffer.concat([decipher.update(cipherData), decipher.final()]);
    } catch {
      // Fallback for legacy 100,000 iterations
      key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      decryptedBuffer = Buffer.concat([decipher.update(cipherData), decipher.final()]);
    }
  }

  if (parsed.compressed) {
    const decompressed = zlib.gunzipSync(decryptedBuffer);
    return decompressed.toString('utf-8');
  }

  return decryptedBuffer.toString('utf-8');
}

export function chunkEncryptedPayload(encryptedPayload: string, maxChunkSizeBytes: number = 3 * 1024 * 1024): Record<string, { content: string }> {
  const totalLength = encryptedPayload.length;
  const numChunks = Math.ceil(totalLength / maxChunkSizeBytes);
  const files: Record<string, { content: string }> = {};

  const manifest = {
    version: 1,
    totalChunks: numChunks,
    totalSizeBytes: totalLength,
    timestamp: new Date().toISOString(),
  };

  files['antigravity_manifest.json'] = {
    content: JSON.stringify(manifest, null, 2),
  };

  for (let i = 0; i < numChunks; i++) {
    const chunkStr = encryptedPayload.substring(i * maxChunkSizeBytes, (i + 1) * maxChunkSizeBytes);
    const fileName = `antigravity_part_${String(i).padStart(3, '0')}.json`;
    files[fileName] = {
      content: JSON.stringify({ index: i, data: chunkStr }),
    };
  }

  return files;
}

export function reassembleChunkedPayload(chunksMap: Record<string, string>): string {
  if (chunksMap['antigravity_cloud_backup.json']) {
    return chunksMap['antigravity_cloud_backup.json'];
  }

  const manifestRaw = chunksMap['antigravity_manifest.json'];
  if (!manifestRaw) {
    throw new Error('Antigravity cloud backup manifest.json not found in Gist.');
  }

  const manifest = JSON.parse(manifestRaw);
  const totalChunks = manifest.totalChunks || 1;

  let assembled = '';
  for (let i = 0; i < totalChunks; i++) {
    const fileName = `antigravity_part_${String(i).padStart(3, '0')}.json`;
    const chunkRaw = chunksMap[fileName];
    if (!chunkRaw) {
      throw new Error(`Missing backup chunk file: ${fileName}`);
    }
    const chunkObj = JSON.parse(chunkRaw);
    assembled += chunkObj.data;
  }

  return assembled;
}
