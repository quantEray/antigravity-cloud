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
exports.SafetyBackup = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SafetyBackup {
    /**
     * Creates an atomic local snapshot backup of the brain directory.
     */
    static async createSnapshot(antigravityDataDir) {
        const brainDir = path.join(antigravityDataDir, 'brain');
        if (!fs.existsSync(brainDir)) {
            return null;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupBaseDir = path.join(antigravityDataDir, 'local_backups');
        const targetBackupDir = path.join(backupBaseDir, `backup_${timestamp}`);
        await fs.promises.mkdir(targetBackupDir, { recursive: true });
        await this.copyRecursive(brainDir, path.join(targetBackupDir, 'brain'));
        // Keep only last 10 backups to preserve disk space
        await this.cleanupOldBackups(backupBaseDir, 10);
        return targetBackupDir;
    }
    static async copyRecursive(src, dest) {
        const stats = await fs.promises.stat(src);
        if (stats.isDirectory()) {
            await fs.promises.mkdir(dest, { recursive: true });
            const entries = await fs.promises.readdir(src);
            for (const entry of entries) {
                await this.copyRecursive(path.join(src, entry), path.join(dest, entry));
            }
        }
        else {
            await fs.promises.copyFile(src, dest);
        }
    }
    static async cleanupOldBackups(backupBaseDir, maxKeep) {
        try {
            if (!fs.existsSync(backupBaseDir))
                return;
            const entries = await fs.promises.readdir(backupBaseDir);
            const backupDirs = entries.filter((e) => e.startsWith('backup_')).sort();
            if (backupDirs.length > maxKeep) {
                const toDelete = backupDirs.slice(0, backupDirs.length - maxKeep);
                for (const dirName of toDelete) {
                    await fs.promises.rm(path.join(backupBaseDir, dirName), { recursive: true, force: true });
                }
            }
        }
        catch {
            // Ignore cleanup errors
        }
    }
}
exports.SafetyBackup = SafetyBackup;
//# sourceMappingURL=safetyBackup.js.map