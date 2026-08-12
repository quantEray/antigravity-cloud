import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { PathNormalizer } from './pathNormalizer';

export interface FileItem {
  relativePath: string; // e.g. conversations/conv-id.db or app_support/shared_proto_db/...
  content: string;
  hash: string;
  sizeBytes: number;
  mtimeMs: number;
}

export interface SyncBundle {
  timestamp: string;
  totalSizeBytes: number;
  totalSizeMB: string;
  files: FileItem[];
  manifestHash: string;
  isIncremental?: boolean;
}

export interface ConversationGroup {
  id: string;
  title: string;
  totalSizeBytes: number;
  totalSizeMB: string;
  lastUpdated: string;
  status: 'synced' | 'modified' | 'local';
  files: FileItem[];
}

interface DeltaStateCache {
  timestamp: string;
  filesState: Record<string, { mtimeMs: number; sizeBytes: number; hash: string }>;
}

export class DeltaEngine {
  public static getAppSupportDir(): string {
    const home = os.homedir();
    if (process.platform === 'win32') {
      return process.env.APPDATA
        ? path.join(process.env.APPDATA, 'Antigravity IDE')
        : path.join(home, 'AppData', 'Roaming', 'Antigravity IDE');
    } else if (process.platform === 'darwin') {
      return path.join(home, 'Library', 'Application Support', 'Antigravity IDE');
    } else {
      return path.join(home, '.config', 'Antigravity IDE');
    }
  }

  public static getCacheFilePath(antigravityDataDir: string): string {
    return path.join(antigravityDataDir, 'delta_sync_state.json');
  }

  public static loadDeltaState(antigravityDataDir: string): DeltaStateCache | null {
    try {
      const cachePath = this.getCacheFilePath(antigravityDataDir);
      if (fs.existsSync(cachePath)) {
        const raw = fs.readFileSync(cachePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  }

  public static async saveDeltaState(antigravityDataDir: string, files: FileItem[]): Promise<void> {
    try {
      const cachePath = this.getCacheFilePath(antigravityDataDir);
      const filesState: Record<string, { mtimeMs: number; sizeBytes: number; hash: string }> = {};

      for (const f of files) {
        filesState[f.relativePath] = {
          mtimeMs: f.mtimeMs,
          sizeBytes: f.sizeBytes,
          hash: f.hash,
        };
      }

      const cacheObj: DeltaStateCache = {
        timestamp: new Date().toISOString(),
        filesState,
      };

      await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
      await fs.promises.writeFile(cachePath, JSON.stringify(cacheObj, null, 2), 'utf-8');
    } catch {}
  }

  /**
   * DISPLAY mode: scans all directories for panel visualization (conversations, brain, implicit).
   */
  public static async scanDataDirectory(antigravityDataDir: string): Promise<SyncBundle> {
    const parentDir = path.dirname(antigravityDataDir); // ~/.gemini
    const files: FileItem[] = [];

    const candidateRootDirs = [
      antigravityDataDir,
      path.join(parentDir, 'antigravity'),
      path.join(parentDir, 'antigravity-ide'),
      path.join(parentDir, 'antigravity-cli'),
    ];

    const scannedDirs = new Set<string>();

    for (const rootDir of candidateRootDirs) {
      if (!fs.existsSync(rootDir)) continue;

      for (const sub of ['conversations', 'brain', 'implicit']) {
        const targetDir = path.join(rootDir, sub);
        if (fs.existsSync(targetDir) && !scannedDirs.has(targetDir)) {
          scannedDirs.add(targetDir);
          await this.scanDirRecursive(targetDir, rootDir, files, false);
        }
      }
    }

    const configDir = path.join(parentDir, 'config');
    if (fs.existsSync(configDir) && !scannedDirs.has(configDir)) {
      scannedDirs.add(configDir);
      await this.scanDirRecursive(configDir, parentDir, files, false);
    }

    return this.buildBundle(files);
  }

  /**
   * SYNC mode with INCREMENTAL DELTA OPTIMIZATION:
   * Compares file mtimeMs and sizeBytes against delta_sync_state.json cache.
   * If a conversation has NO changed files, its static history is skipped from heavy re-uploading.
   * Only NEW/MODIFIED conversations + system indexes (shared_proto_db, state.vscdb) are packaged!
   */
  public static async scanForSync(antigravityDataDir: string, forceFull: boolean = false): Promise<SyncBundle> {
    const parentDir = path.dirname(antigravityDataDir); // ~/.gemini
    const allScannedFiles: FileItem[] = [];

    const candidateRootDirs = [
      antigravityDataDir,
      path.join(parentDir, 'antigravity'),
      path.join(parentDir, 'antigravity-ide'),
      path.join(parentDir, 'antigravity-cli'),
    ];

    const scannedDirs = new Set<string>();

    // 1. Scan conversations, brain, implicit
    for (const rootDir of candidateRootDirs) {
      if (!fs.existsSync(rootDir)) continue;

      for (const sub of ['conversations', 'brain', 'implicit']) {
        const targetDir = path.join(rootDir, sub);
        if (fs.existsSync(targetDir) && !scannedDirs.has(targetDir)) {
          scannedDirs.add(targetDir);
          await this.scanDirRecursive(targetDir, rootDir, allScannedFiles, false);
        }
      }
    }

    // 2. Scan config
    const configDir = path.join(parentDir, 'config');
    if (fs.existsSync(configDir) && !scannedDirs.has(configDir)) {
      scannedDirs.add(configDir);
      await this.scanDirRecursive(configDir, parentDir, allScannedFiles, false);
    }

    // 3. Scan shared_proto_db & state.vscdb index from Application Support
    const appSupportDir = this.getAppSupportDir();
    if (fs.existsSync(appSupportDir)) {
      const protoDbDir = path.join(appSupportDir, 'shared_proto_db');
      if (fs.existsSync(protoDbDir)) {
        await this.scanDirRecursive(protoDbDir, appSupportDir, allScannedFiles, false, 'app_support');
      }

      const globalStateDb = path.join(appSupportDir, 'User', 'globalStorage', 'state.vscdb');
      if (fs.existsSync(globalStateDb)) {
        try {
          const stats = await fs.promises.stat(globalStateDb);
          if (stats.size <= 10 * 1024 * 1024) {
            const buffer = await fs.promises.readFile(globalStateDb);
            const fileContent = 'base64:' + buffer.toString('base64');
            const relativePath = 'app_support/User/globalStorage/state.vscdb';
            const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

            allScannedFiles.push({
              relativePath,
              content: fileContent,
              hash,
              sizeBytes: stats.size,
              mtimeMs: stats.mtimeMs,
            });
          }
        } catch {}
      }
    }

    // Incremental Delta Check
    const cachedState = forceFull ? null : this.loadDeltaState(antigravityDataDir);
    let finalFilesToSync: FileItem[] = allScannedFiles;
    let isIncremental = false;

    if (cachedState && cachedState.filesState) {
      const dirtyConvIds = new Set<string>();
      const dirtyFilesSet = new Set<string>();

      for (const f of allScannedFiles) {
        const cached = cachedState.filesState[f.relativePath];
        const isSystemIndex = f.relativePath.startsWith('config/') || f.relativePath.startsWith('app_support/');

        // If file is new or modified
        if (!cached || cached.mtimeMs !== f.mtimeMs || cached.sizeBytes !== f.sizeBytes) {
          dirtyFilesSet.add(f.relativePath);

          if (!isSystemIndex) {
            const parts = f.relativePath.split('/');
            let convId = '';
            if (parts[0] === 'conversations') convId = parts[1].replace(/\.(db|db-wal|db-shm)$/, '');
            else if (parts[0] === 'brain' && parts.length >= 2) convId = parts[1];
            else if (parts[0] === 'implicit' && parts.length >= 2) convId = parts[1].replace(/\.pb$/, '');

            if (convId) dirtyConvIds.add(convId);
          }
        }
      }

      // If at least some files changed (but not everything), perform fast delta bundle
      if (dirtyFilesSet.size > 0 && dirtyFilesSet.size < allScannedFiles.length) {
        isIncremental = true;
        finalFilesToSync = allScannedFiles.filter((f) => {
          const isSystemIndex = f.relativePath.startsWith('config/') || f.relativePath.startsWith('app_support/');
          if (isSystemIndex) return true; // Always include updated system indexes

          const parts = f.relativePath.split('/');
          let convId = '';
          if (parts[0] === 'conversations') convId = parts[1].replace(/\.(db|db-wal|db-shm)$/, '');
          else if (parts[0] === 'brain' && parts.length >= 2) convId = parts[1];
          else if (parts[0] === 'implicit' && parts.length >= 2) convId = parts[1].replace(/\.pb$/, '');

          // Include file if its conversation is marked dirty/modified or file itself is dirty
          return dirtyConvIds.has(convId) || dirtyFilesSet.has(f.relativePath);
        });
      }
    }

    finalFilesToSync.sort((a, b) => b.mtimeMs - a.mtimeMs);
    const bundle = this.buildBundle(finalFilesToSync);
    bundle.isIncremental = isIncremental;
    return bundle;
  }

  private static buildBundle(files: FileItem[]): SyncBundle {
    const sorted = [...files].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    const totalSizeBytes = sorted.reduce((acc, f) => acc + f.sizeBytes, 0);
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
    const manifestContent = sorted.map((f) => `${f.relativePath}:${f.hash}`).join('\n');
    const manifestHash = crypto.createHash('sha256').update(manifestContent).digest('hex');

    return {
      timestamp: new Date().toISOString(),
      totalSizeBytes,
      totalSizeMB,
      files: sorted,
      manifestHash,
    };
  }

  public static groupFilesByConversation(bundle: SyncBundle, antigravityDataDir?: string): ConversationGroup[] {
    const groupsMap = new Map<string, FileItem[]>();
    const configFiles: FileItem[] = [];

    const deltaCache = antigravityDataDir ? this.loadDeltaState(antigravityDataDir) : null;

    for (const file of bundle.files) {
      const parts = file.relativePath.split('/');
      let convId = 'global-config';

      if (parts[0] === 'brain' && parts.length > 1) {
        convId = parts[1];
      } else if (parts[0] === 'conversations' && parts.length > 1) {
        convId = parts[1].replace(/\.(db|db-wal|db-shm)$/, '');
      } else if (parts[0] === 'implicit' && parts.length > 1) {
        convId = parts[1].replace(/\.pb$/, '');
      } else {
        configFiles.push(file);
        continue;
      }
      if (!groupsMap.has(convId)) {
        groupsMap.set(convId, []);
      }
      groupsMap.get(convId)!.push(file);
    }

    const result: ConversationGroup[] = [];

    for (const [convId, files] of groupsMap.entries()) {
      let title = '';
      const groupSizeBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
      const groupSizeMB = (groupSizeBytes / (1024 * 1024)).toFixed(2);

      const maxMtime = Math.max(...files.map((f) => f.mtimeMs), 0);
      const lastUpdated = maxMtime > 0 ? new Date(maxMtime).toLocaleDateString() : 'Unknown';

      for (const file of files) {
        if (file.relativePath.endsWith('metadata.json')) {
          try {
            const parsed = JSON.parse(file.content);
            if (parsed.Summary) title = parsed.Summary.substring(0, 65);
            else if (parsed.title) title = parsed.title.substring(0, 65);
          } catch {}
        } else if (file.relativePath.endsWith('transcript.jsonl')) {
          const lines = file.content.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj = JSON.parse(line);
              if (obj.type === 'USER_INPUT' && obj.content) {
                let text = obj.content;
                if (text.includes('<USER_REQUEST>')) {
                  const match = text.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                  if (match && match[1]) text = match[1].trim();
                }
                text = text.replace(/^[\/\s\n\r\t]+/, '').trim();
                if (text.length > 10) {
                  title = text.substring(0, 65);
                  break;
                }
              }
            } catch {}
          }
        }
        if (title) break;
      }

      if (!title) {
        for (const file of files) {
          if (file.relativePath.endsWith('.db')) {
            try {
              const str = file.content;
              const titleMatches = str.match(/[\x20-\x7E]{12,70}/g);
              if (titleMatches && titleMatches.length > 0) {
                const textChunks = titleMatches.filter((s) => s.length >= 12 && /[a-zA-Z]/.test(s));
                for (const chunk of textChunks) {
                  let clean = chunk.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
                  clean = clean.replace(/^[\/\s\n\r\t]+/, '').replace(/^SQLite format \d+/, '').trim();
                  if (
                    clean.length >= 12 &&
                    !clean.includes('sqlite') &&
                    !clean.includes('TABLE') &&
                    !clean.includes('INDEX') &&
                    !clean.includes('file:///') &&
                    !clean.includes('http') &&
                    !clean.includes('trajectory') &&
                    !clean.includes('battle_mode') &&
                    !clean.includes('Along with each USER request') &&
                    !clean.includes('conversation_summaries') &&
                    !clean.includes('System prompt') &&
                    !clean.includes('toolAction') &&
                    !clean.includes('PRIMARY KEY') &&
                    !clean.startsWith('function') &&
                    !clean.startsWith('import ') &&
                    !clean.startsWith('export ') &&
                    !/^[0-9a-f\-]{30,}$/i.test(clean)
                  ) {
                    title = clean.substring(0, 65);
                    break;
                  }
                }
              }
            } catch {}
          }
        }
      }

      if (title) {
        title = title.replace(/^[\/\s\n\r\t]+/, '').replace(/^SQLite format \d+/, '').replace(/^\\n/, '').trim();
        if (title.length > 65) title = title.substring(0, 65) + '...';
      } else {
        title = `Chat Session (${convId.substring(0, 8)})`;
      }

      // Filter out empty ghost placeholders (< 10 KB and no user title extracted)
      const isGhost = groupSizeBytes < 10240 && title.startsWith('Chat Session');
      if (isGhost && convId !== 'global-config') {
        continue; // Exclude empty 0.00 MB ghost files from active conversations list
      }

      let groupStatus: 'synced' | 'modified' | 'local' = 'local';
      if (deltaCache && deltaCache.filesState) {
        const allMatch = files.every((f) => {
          const cached = deltaCache.filesState[f.relativePath];
          return cached && cached.mtimeMs === f.mtimeMs && cached.sizeBytes === f.sizeBytes;
        });
        groupStatus = allMatch ? 'synced' : 'modified';
      }

      result.push({
        id: convId,
        title,
        totalSizeBytes: groupSizeBytes,
        totalSizeMB: groupSizeMB,
        lastUpdated,
        status: groupStatus,
        files,
      });
    }

    if (configFiles.length > 0) {
      const configSizeBytes = configFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
      let configStatus: 'synced' | 'modified' | 'local' = 'local';
      if (deltaCache && deltaCache.filesState) {
        const allMatch = configFiles.every((f) => {
          const cached = deltaCache.filesState[f.relativePath];
          return cached && cached.mtimeMs === f.mtimeMs && cached.sizeBytes === f.sizeBytes;
        });
        configStatus = allMatch ? 'synced' : 'modified';
      }

      result.push({
        id: 'global-config',
        title: 'Global Config & System Indexes',
        totalSizeBytes: configSizeBytes,
        totalSizeMB: (configSizeBytes / (1024 * 1024)).toFixed(2),
        lastUpdated: 'Current',
        status: configStatus,
        files: configFiles,
      });
    }

    return result;
  }

  private static async scanDirRecursive(
    currentDir: string,
    baseDir: string,
    result: FileItem[],
    textOnly: boolean = false,
    prefix: string = ''
  ): Promise<void> {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'tasks') {
          continue;
        }
        await this.scanDirRecursive(fullPath, baseDir, result, textOnly, prefix);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        if (['.webp', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webm', '.zip', '.gz'].includes(ext)) {
          continue;
        }
        if (entry.name.endsWith('.log') && !entry.name.includes('transcript') && !fullPath.includes('shared_proto_db')) {
          continue;
        }

        try {
          const stats = await fs.promises.stat(fullPath);
          if (stats.size > 50 * 1024 * 1024) continue;

          const isBinary = ['.db', '.db-wal', '.db-shm', '.pb', '.vscdb'].includes(ext) || fullPath.includes('shared_proto_db');

          if (textOnly && isBinary) continue;

          let fileContent = '';
          if (isBinary) {
            const buffer = await fs.promises.readFile(fullPath);
            fileContent = 'base64:' + buffer.toString('base64');
          } else {
            const rawContent = await fs.promises.readFile(fullPath, 'utf-8');
            fileContent = PathNormalizer.normalize(rawContent);
          }

          let relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
          if (prefix) {
            relativePath = `${prefix}/${relativePath}`;
          }
          const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

          result.push({
            relativePath,
            content: fileContent,
            hash,
            sizeBytes: stats.size,
            mtimeMs: stats.mtimeMs,
          });
        } catch {
          // File might be locked or unreadable temporarily
        }
      }
    }
  }

  public static async restoreBundle(antigravityDataDir: string, bundle: SyncBundle): Promise<number> {
    const parentDir = path.dirname(antigravityDataDir); // ~/.gemini
    const appSupportDir = this.getAppSupportDir();
    let restoredCount = 0;

    for (const item of bundle.files) {
      let baseTarget = antigravityDataDir;
      let relPath = item.relativePath;

      if (item.relativePath.startsWith('config/')) {
        baseTarget = parentDir;
      } else if (item.relativePath.startsWith('app_support/')) {
        baseTarget = appSupportDir;
        relPath = item.relativePath.substring(12); // Remove 'app_support/'
      }

      // Normalize slashes for target operating system (Windows vs Mac)
      const normalizedRelPath = relPath.replace(/\//g, path.sep);
      const targetPath = path.join(baseTarget, normalizedRelPath);
      const targetDir = path.dirname(targetPath);

      await fs.promises.mkdir(targetDir, { recursive: true });

      if (item.content.startsWith('base64:')) {
        const buffer = Buffer.from(item.content.substring(7), 'base64');
        await fs.promises.writeFile(targetPath, buffer);
      } else {
        const denormalizedContent = PathNormalizer.denormalize(item.content);
        await fs.promises.writeFile(targetPath, denormalizedContent, 'utf-8');
      }

      restoredCount++;
    }

    return restoredCount;
  }
}
