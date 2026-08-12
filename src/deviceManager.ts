import * as os from 'os';
import * as crypto from 'crypto';
import * as vscode from 'vscode';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: 'mac' | 'windows' | 'linux';
  osRelease: string;
  lastSyncTime?: string;
}

export class DeviceManager {
  private static cachedDevice: DeviceInfo | null = null;

  public static getDeviceInfo(): DeviceInfo {
    if (this.cachedDevice) return this.cachedDevice;

    const config = vscode.workspace.getConfiguration('antigravityAnywhere');
    let deviceId = config.get<string>('deviceId', '').trim();

    if (!deviceId) {
      deviceId = 'dev_' + crypto.randomBytes(8).toString('hex');
      config.update('deviceId', deviceId, vscode.ConfigurationTarget.Global);
    }

    const platformRaw = os.platform();
    let platform: 'mac' | 'windows' | 'linux' = 'linux';
    if (platformRaw === 'darwin') platform = 'mac';
    else if (platformRaw === 'win32') platform = 'windows';

    const hostname = os.hostname();
    const osType = platform === 'mac' ? 'macOS' : (platform === 'windows' ? 'Windows' : 'Linux');
    const deviceName = `${hostname} (${osType})`;

    this.cachedDevice = {
      deviceId,
      deviceName,
      platform,
      osRelease: os.release(),
      lastSyncTime: new Date().toISOString(),
    };

    return this.cachedDevice;
  }
}
