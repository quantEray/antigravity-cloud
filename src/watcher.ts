import * as fs from 'fs';
import * as path from 'path';

export class FileWatcher {
  private watcher: fs.FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private onTriggerSync: () => void;
  private debounceMs: number;

  constructor(debounceSeconds: number, onTriggerSync: () => void) {
    this.debounceMs = debounceSeconds * 1000;
    this.onTriggerSync = onTriggerSync;
  }

  public startWatching(antigravityDataDir: string): void {
    const brainDir = path.join(antigravityDataDir, 'brain');

    if (!fs.existsSync(brainDir)) {
      try {
        fs.mkdirSync(brainDir, { recursive: true });
      } catch {
        return;
      }
    }

    try {
      this.watcher = fs.watch(brainDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.log')) return;
        this.handleChange();
      });
    } catch {
      // Fallback if recursive watch not supported on some platform versions
    }
  }

  private handleChange(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.onTriggerSync();
    }, this.debounceMs);
  }

  public stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
