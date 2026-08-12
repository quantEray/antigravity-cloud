"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const pathNormalizer_1 = require("./pathNormalizer");
class DeltaEngine {
    static getAppSupportDir() {
        const home = os.homedir();
        if (process.platform === 'win32') {
            return process.env.APPDATA
                ? path.join(process.env.APPDATA, 'Antigravity IDE')
                : path.join(home, 'AppData', 'Roaming', 'Antigravity IDE');
        }
        else if (process.platform === 'darwin') {
            return path.join(home, 'Library', 'Application Support', 'Antigravity IDE');
        }
        else {
            return path.join(home, '.config', 'Antigravity IDE');
        }
    }
    static getCacheFilePath(antigravityDataDir) {
        return path.join(antigravityDataDir, 'delta_sync_state.json');
    }
    static loadDeltaState(antigravityDataDir) {
        try {
            const cachePath = this.getCacheFilePath(antigravityDataDir);
            if (fs.existsSync(cachePath)) {
                const raw = fs.readFileSync(cachePath, 'utf-8');
                return JSON.parse(raw);
            }
        }
        catch { }
        return null;
    }
    static async saveDeltaState(antigravityDataDir, files) {
        try {
            const cachePath = this.getCacheFilePath(antigravityDataDir);
            const filesState = {};
            for (const f of files) {
                filesState[f.relativePath] = {
                    mtimeMs: f.mtimeMs,
                    sizeBytes: f.sizeBytes,
                    hash: f.hash,
                };
            }
            const cacheObj = {
                timestamp: new Date().toISOString(),
                filesState,
            };
            await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
            await fs.promises.writeFile(cachePath, JSON.stringify(cacheObj, null, 2), 'utf-8');
        }
        catch { }
    }
    /**
     * DISPLAY mode: scans all directories for panel visualization (conversations, brain, implicit).
     */
    static async scanDataDirectory(antigravityDataDir) {
        const parentDir = path.dirname(antigravityDataDir); // ~/.gemini
        const files = [];
        const candidateRootDirs = [
            antigravityDataDir,
            path.join(parentDir, 'antigravity'),
            path.join(parentDir, 'antigravity-ide'),
            path.join(parentDir, 'antigravity-cli'),
        ];
        const scannedDirs = new Set();
        for (const rootDir of candidateRootDirs) {
            if (!fs.existsSync(rootDir))
                continue;
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
    static async scanForSync(antigravityDataDir, forceFull = false) {
        const parentDir = path.dirname(antigravityDataDir); // ~/.gemini
        const allScannedFiles = [];
        const candidateRootDirs = [
            antigravityDataDir,
            path.join(parentDir, 'antigravity'),
            path.join(parentDir, 'antigravity-ide'),
            path.join(parentDir, 'antigravity-cli'),
        ];
        const scannedDirs = new Set();
        // 1. Scan conversations, brain, implicit
        for (const rootDir of candidateRootDirs) {
            if (!fs.existsSync(rootDir))
                continue;
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
                }
                catch { }
            }
        }
        // Incremental Delta Check
        const cachedState = forceFull ? null : this.loadDeltaState(antigravityDataDir);
        let finalFilesToSync = allScannedFiles;
        let isIncremental = false;
        if (cachedState && cachedState.filesState) {
            const dirtyConvIds = new Set();
            const dirtyFilesSet = new Set();
            for (const f of allScannedFiles) {
                const cached = cachedState.filesState[f.relativePath];
                const isSystemIndex = f.relativePath.startsWith('config/') || f.relativePath.startsWith('app_support/');
                // If file is new or modified
                if (!cached || cached.mtimeMs !== f.mtimeMs || cached.sizeBytes !== f.sizeBytes) {
                    dirtyFilesSet.add(f.relativePath);
                    if (!isSystemIndex) {
                        const parts = f.relativePath.split('/');
                        let convId = '';
                        if (parts[0] === 'conversations')
                            convId = parts[1].replace(/\.(db|db-wal|db-shm)$/, '');
                        else if (parts[0] === 'brain' && parts.length >= 2)
                            convId = parts[1];
                        else if (parts[0] === 'implicit' && parts.length >= 2)
                            convId = parts[1].replace(/\.pb$/, '');
                        if (convId)
                            dirtyConvIds.add(convId);
                    }
                }
            }
            // If at least some files changed (but not everything), perform fast delta bundle
            if (dirtyFilesSet.size > 0 && dirtyFilesSet.size < allScannedFiles.length) {
                isIncremental = true;
                finalFilesToSync = allScannedFiles.filter((f) => {
                    const isSystemIndex = f.relativePath.startsWith('config/') || f.relativePath.startsWith('app_support/');
                    if (isSystemIndex)
                        return true; // Always include updated system indexes
                    const parts = f.relativePath.split('/');
                    let convId = '';
                    if (parts[0] === 'conversations')
                        convId = parts[1].replace(/\.(db|db-wal|db-shm)$/, '');
                    else if (parts[0] === 'brain' && parts.length >= 2)
                        convId = parts[1];
                    else if (parts[0] === 'implicit' && parts.length >= 2)
                        convId = parts[1].replace(/\.pb$/, '');
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
    static buildBundle(files) {
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
    static groupFilesByConversation(bundle) {
        const groupsMap = new Map();
        const configFiles = [];
        for (const file of bundle.files) {
            if (file.relativePath.startsWith('config/') || file.relativePath.startsWith('app_support/')) {
                configFiles.push(file);
                continue;
            }
            const parts = file.relativePath.split('/');
            let convId = 'other';
            if (parts[0] === 'conversations') {
                convId = parts[1].replace(/\.(db|db-wal|db-shm)$/, '');
            }
            else if (parts[0] === 'brain' && parts.length >= 2) {
                convId = parts[1];
            }
            else if (parts[0] === 'implicit' && parts.length >= 2) {
                convId = parts[1].replace(/\.pb$/, '');
            }
            if (!groupsMap.has(convId)) {
                groupsMap.set(convId, []);
            }
            groupsMap.get(convId).push(file);
        }
        const result = [];
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
                        if (parsed.Summary)
                            title = parsed.Summary.substring(0, 65);
                        else if (parsed.title)
                            title = parsed.title.substring(0, 65);
                    }
                    catch { }
                }
                else if (file.relativePath.endsWith('transcript.jsonl')) {
                    const lines = file.content.split('\n');
                    for (const line of lines) {
                        if (!line.trim())
                            continue;
                        try {
                            const obj = JSON.parse(line);
                            if (obj.type === 'USER_INPUT' && obj.content) {
                                let text = obj.content;
                                if (text.includes('<USER_REQUEST>')) {
                                    const match = text.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                                    if (match)
                                        text = match[1];
                                }
                                text = text.replace(/<[^>]+>/g, '').replace(/\\n|\n|\r|\t/g, ' ').replace(/\s+/g, ' ').trim();
                                text = text.replace(/^[\/\s\n\r\t]+/, '').trim();
                                if (text.length > 5 && !text.startsWith('{') && !text.includes('Along with each USER request')) {
                                    title = text.substring(0, 65);
                                    break;
                                }
                            }
                        }
                        catch { }
                    }
                }
                else if (file.relativePath.endsWith('.db') && !title) {
                    try {
                        const str = file.content; // text or base64
                        const rawStr = str.startsWith('base64:') ? Buffer.from(str.substring(7), 'base64').toString('utf-8') : str;
                        // Tier 1: Search for Plan titles like "Aligning Strategy and Virtual Engine Profits"
                        const planMatch = rawStr.match(/[A-Z\u00C0-\u017F][a-zA-Z0-9\u00C0-\u017F\s]{10,80}(?:Strategy|Profits|Engine|System|Manager|Dashboard|Sync|Filter|Search|Bot|TradingView|Setup|Login)/);
                        if (planMatch) {
                            title = planMatch[0].trim();
                        }
                        // Tier 2: Extract from <USER_REQUEST> tags
                        if (!title) {
                            const reqMatches = [...rawStr.matchAll(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g)];
                            if (reqMatches.length > 0) {
                                for (const m of reqMatches) {
                                    let clean = m[1].replace(/<[^>]+>/g, '').replace(/\\n|\n|\r|\t/g, ' ').replace(/\s+/g, ' ').trim();
                                    clean = clean.replace(/^[\/\s\n\r\t]+/, '').trim();
                                    if (clean.length > 5 && !clean.includes('Along with each USER request')) {
                                        title = clean.substring(0, 65);
                                        break;
                                    }
                                }
                            }
                        }
                        // Tier 3: Search for human Turkish/English text blocks
                        if (!title) {
                            const textChunks = rawStr.match(/[\u0080-\uFFFFa-zA-Z0-9\s,\.\?\!]{15,120}/g) || [];
                            for (const chunk of textChunks) {
                                let clean = chunk.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
                                clean = clean.replace(/^[\/\s\n\r\t]+/, '').replace(/^SQLite format \d+/, '').trim();
                                if (clean.length >= 12 &&
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
                                    !/^[0-9a-f\-]{30,}$/i.test(clean)) {
                                    title = clean.substring(0, 65);
                                    break;
                                }
                            }
                        }
                    }
                    catch { }
                }
            }
            if (title) {
                title = title.replace(/^[\/\s\n\r\t]+/, '').replace(/^SQLite format \d+/, '').replace(/^\\n/, '').trim();
                if (title.length > 65)
                    title = title.substring(0, 65) + '...';
            }
            else {
                title = `Chat Session (${convId.substring(0, 8)})`;
            }
            // Filter out empty ghost placeholders (< 10 KB and no user title extracted)
            const isGhost = groupSizeBytes < 10240 && title.startsWith('Chat Session');
            if (isGhost && convId !== 'global-config') {
                continue; // Exclude empty 0.00 MB ghost files from active conversations list
            }
            result.push({
                id: convId,
                title,
                totalSizeBytes: groupSizeBytes,
                totalSizeMB: groupSizeMB,
                lastUpdated,
                files,
            });
        }
        if (configFiles.length > 0) {
            const configSizeBytes = configFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
            result.push({
                id: 'global-config',
                title: 'Global Config & System Indexes',
                totalSizeBytes: configSizeBytes,
                totalSizeMB: (configSizeBytes / (1024 * 1024)).toFixed(2),
                lastUpdated: 'Current',
                files: configFiles,
            });
        }
        return result;
    }
    static async scanDirRecursive(currentDir, baseDir, result, textOnly = false, prefix = '') {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'tasks') {
                    continue;
                }
                await this.scanDirRecursive(fullPath, baseDir, result, textOnly, prefix);
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.webp', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webm', '.zip', '.gz'].includes(ext)) {
                    continue;
                }
                if (entry.name.endsWith('.log') && !entry.name.includes('transcript') && !fullPath.includes('shared_proto_db')) {
                    continue;
                }
                try {
                    const stats = await fs.promises.stat(fullPath);
                    if (stats.size > 50 * 1024 * 1024)
                        continue;
                    const isBinary = ['.db', '.db-wal', '.db-shm', '.pb', '.vscdb'].includes(ext) || fullPath.includes('shared_proto_db');
                    if (textOnly && isBinary)
                        continue;
                    let fileContent = '';
                    if (isBinary) {
                        const buffer = await fs.promises.readFile(fullPath);
                        fileContent = 'base64:' + buffer.toString('base64');
                    }
                    else {
                        const rawContent = await fs.promises.readFile(fullPath, 'utf-8');
                        fileContent = pathNormalizer_1.PathNormalizer.normalize(rawContent);
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
                }
                catch {
                    // File might be locked or unreadable temporarily
                }
            }
        }
    }
    static async restoreBundle(antigravityDataDir, bundle) {
        const parentDir = path.dirname(antigravityDataDir); // ~/.gemini
        const appSupportDir = this.getAppSupportDir();
        let restoredCount = 0;
        for (const item of bundle.files) {
            let baseTarget = antigravityDataDir;
            let relPath = item.relativePath;
            if (item.relativePath.startsWith('config/')) {
                baseTarget = parentDir;
            }
            else if (item.relativePath.startsWith('app_support/')) {
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
            }
            else {
                const denormalizedContent = pathNormalizer_1.PathNormalizer.denormalize(item.content);
                await fs.promises.writeFile(targetPath, denormalizedContent, 'utf-8');
            }
            restoredCount++;
        }
        return restoredCount;
    }
}
exports.DeltaEngine = DeltaEngine;
//# sourceMappingURL=deltaEngine.js.map