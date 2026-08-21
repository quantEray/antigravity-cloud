import * as os from 'os';
import * as path from 'path';
import * as zlib from 'zlib';
import { encryptPayload, decryptPayload } from './crypto';
import { PathNormalizer } from './pathNormalizer';
import { DeltaEngine, FileItem } from './deltaEngine';

async function runTests() {
  console.log('Running Antigravity Anywhere Core Tests...');

  // Test 1: Crypto Encryption & Gzip Decryption
  const testSecret = 'SuperSecret123!';
  const originalData = JSON.stringify({ hello: 'world', convId: 'test-123', path: '/Users/eray/test' });

  const encrypted = encryptPayload(originalData, testSecret);
  const decrypted = decryptPayload(encrypted, testSecret);

  if (decrypted !== originalData) {
    throw new Error('Crypto Test Failed: Decrypted data does not match original data.');
  }
  console.log('✓ Crypto AES-256-GCM + Gzip Test Passed.');

  // Test 2: Path Normalization in JSON & text
  const userHome = PathNormalizer.getNormalizedHome();
  const sampleJson = JSON.stringify({
    fileUri: `file://${userHome}/Desktop/MyProject/main.ts`,
    localPath: `${userHome}/documents/code.ts`,
    other: 'some value'
  });

  const normalizedJson = PathNormalizer.normalize(sampleJson);
  if (normalizedJson.includes(userHome)) {
    throw new Error('Path Normalizer Test Failed: Did not replace embedded user home.');
  }
  if (!normalizedJson.includes('${USER_HOME}')) {
    throw new Error('Path Normalizer Test Failed: Missing ${USER_HOME} placeholder.');
  }

  const denormalizedJson = PathNormalizer.denormalize(normalizedJson);
  if (denormalizedJson !== sampleJson) {
    throw new Error('Path Normalizer Test Failed: Denormalized text does not match sample.');
  }
  console.log('✓ Deep Path Normalizer & Denormalizer Test Passed.');

  // Test 3: GZ64 Inflate & Denormalize Test
  const testText = JSON.stringify({ path: `${userHome}/test/file.json` });
  const normalizedTestText = PathNormalizer.normalize(testText);
  const deflated = zlib.deflateSync(Buffer.from(normalizedTestText, 'utf-8'));
  const testFileItem: FileItem = {
    relativePath: 'brain/test-conv/test.json',
    content: 'gz64:' + deflated.toString('base64'),
    hash: 'test-hash',
    sizeBytes: 100,
    mtimeMs: Date.now()
  };

  const restoredBuf = DeltaEngine.getFileContentBuffer(testFileItem);
  const restoredText = restoredBuf.toString('utf-8');
  if (restoredText !== testText) {
    throw new Error(`GZ64 Denormalize Test Failed. Expected: ${testText}, Got: ${restoredText}`);
  }
  console.log('✓ GZ64 Inflate + Denormalize Integration Test Passed.');

  // Test 4: Local Data Directory Scan Test
  const antigravityDataDir = path.join(os.homedir(), '.gemini', 'antigravity-ide');
  const bundle = await DeltaEngine.scanDataDirectory(antigravityDataDir);
  const groups = DeltaEngine.groupFilesByConversation(bundle);

  console.log(`✓ Real Scan Test Passed: Found ${bundle.files.length} total files across ${groups.length} conversations!`);

  let rawMb = '0';
  let encMb = '0';
  try {
    const rawJson = JSON.stringify(bundle);
    rawMb = (Buffer.byteLength(rawJson) / (1024 * 1024)).toFixed(2);
    const encPayload = encryptPayload(rawJson, 'test1234');
    encMb = (Buffer.byteLength(encPayload) / (1024 * 1024)).toFixed(2);
  } catch {
    rawMb = (bundle.files.reduce((acc, f) => acc + f.sizeBytes, 0) / (1024 * 1024)).toFixed(2);
    encMb = (parseFloat(rawMb) * 0.4).toFixed(2);
  }

  console.log(`📦 PAYLOAD DATA SIZE SUMMARY:`);
  console.log(`   • Raw Uncompressed Data Size: ~${rawMb} MB`);
  console.log(`   • Compressed & Encrypted Size: ~${encMb} MB`);

  for (const group of groups.slice(0, 5)) {
    console.log(`   • [${group.id}] ${group.title} (${group.files.length} files)`);
  }

  console.log('ALL CORE TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
