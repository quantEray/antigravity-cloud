import * as fs from 'fs';
import * as path from 'path';

export class SafetyBackup {
  /**
   * Creates an atomic local snapshot backup of the brain directory.
   */
  public static async createSnapshot(antigravityDataDir: string): Promise<string | null> {
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

  private static async copyRecursive(src: string, dest: string): Promise<void> {
    const stats = await fs.promises.stat(src);

    if (stats.isDirectory()) {
      await fs.promises.mkdir(dest, { recursive: true });
      const entries = await fs.promises.readdir(src);
      for (const entry of entries) {
        await this.copyRecursive(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      await fs.promises.copyFile(src, dest);
    }
  }

  private static async cleanupOldBackups(backupBaseDir: string, maxKeep: number): Promise<void> {
    try {
      if (!fs.existsSync(backupBaseDir)) return;
      const entries = await fs.promises.readdir(backupBaseDir);
      const backupDirs = entries.filter((e) => e.startsWith('backup_')).sort();

      if (backupDirs.length > maxKeep) {
        const toDelete = backupDirs.slice(0, backupDirs.length - maxKeep);
        for (const dirName of toDelete) {
          await fs.promises.rm(path.join(backupBaseDir, dirName), { recursive: true, force: true });
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
