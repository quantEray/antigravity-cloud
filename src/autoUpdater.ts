import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class AutoUpdater {
  private strokeRepo = 'quantEray/antigravity-cloud';

  public static async checkForUpdates(context: vscode.ExtensionContext, manualCheck = false): Promise<void> {
    const currentVersion = context.extension?.packageJSON?.version || '0.1.0';

    try {
      const releaseInfo = await AutoUpdater.fetchLatestRelease();
      if (!releaseInfo || !releaseInfo.tag_name) {
        if (manualCheck) {
          vscode.window.showInformationMessage('☁️ Antigravity Cloud: Unable to check for updates right now.');
        }
        return;
      }

      const latestVersion = releaseInfo.tag_name.replace(/^v/, '');
      const isNewer = AutoUpdater.compareVersions(latestVersion, currentVersion) > 0;

      if (isNewer) {
        const vsixAsset = releaseInfo.assets?.find((a: any) => a.name.endsWith('.vsix'));
        const downloadUrl = vsixAsset?.browser_download_url || `https://github.com/quantEray/antigravity-cloud/releases/download/${releaseInfo.tag_name}/antigravity-anywhere-${latestVersion}.vsix`;

        const choice = await vscode.window.showInformationMessage(
          `🚀 Antigravity Cloud update v${latestVersion} is available! (Current: v${currentVersion})`,
          '⚡ Update Now',
          'Later'
        );

        if (choice === '⚡ Update Now') {
          await AutoUpdater.downloadAndInstallUpdate(downloadUrl, latestVersion);
        }
      } else if (manualCheck) {
        vscode.window.showInformationMessage(`✨ Antigravity Cloud is up to date (v${currentVersion}).`);
      }
    } catch (err: any) {
      if (manualCheck) {
        vscode.window.showErrorMessage(`Update check failed: ${err.message}`);
      }
    }
  }

  private static async fetchLatestRelease(): Promise<any> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/quantEray/antigravity-cloud/releases/latest',
        method: 'GET',
        headers: {
          'User-Agent': 'Antigravity-Cloud-Extension',
        },
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            https.get(redirectUrl, { headers: { 'User-Agent': 'Antigravity-Cloud-Extension' } }, (rRes) => {
              let data = '';
              rRes.on('data', (chunk) => (data += chunk));
              rRes.on('end', () => {
                try { resolve(JSON.parse(data)); } catch { resolve(null); }
              });
            });
            return;
          }
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve(null); }
        });
      });

      req.on('error', () => resolve(null));
      req.end();
    });
  }

  private static async downloadAndInstallUpdate(url: string, version: string): Promise<void> {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `📥 Downloading Antigravity Cloud v${version}...`,
        cancellable: false,
      },
      async (progress) => {
        const tmpPath = path.join(os.tmpdir(), `antigravity-anywhere-${version}.vsix`);
        await AutoUpdater.downloadFile(url, tmpPath, progress);

        progress.report({ message: 'Installing extension package...' });
        await vscode.commands.executeCommand('workbench.extensions.installExtension', vscode.Uri.file(tmpPath));

        try { fs.unlinkSync(tmpPath); } catch {}

        const reloadChoice = await vscode.window.showInformationMessage(
          `🎉 Antigravity Cloud updated to v${version} successfully!`,
          '🔄 Reload Window'
        );

        if (reloadChoice === '🔄 Reload Window') {
          await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      }
    );
  }

  private static downloadFile(url: string, destPath: string, progress: vscode.Progress<{ message?: string; increment?: number }>): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);

      const request = (targetUrl: string) => {
        https.get(targetUrl, { headers: { 'User-Agent': 'Antigravity-Cloud-Extension' } }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            if (res.headers.location) {
              request(res.headers.location);
              return;
            }
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download: HTTP status ${res.statusCode}`));
            return;
          }

          const totalSize = parseInt(res.headers['content-length'] || '0', 10);
          let downloaded = 0;

          res.on('data', (chunk) => {
            downloaded += chunk.length;
            if (totalSize > 0) {
              const pct = Math.round((downloaded / totalSize) * 100);
              progress.report({ message: `${pct}% (${(downloaded / (1024 * 1024)).toFixed(2)} MB)` });
            }
          });

          res.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(destPath, () => reject(err));
        });
      };

      request(url);
    });
  }

  private static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }
}
