import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

export interface AntigravityConfig {
  googleDriveToken: string;
  googleRefreshToken: string;
  driveFileId: string;
  googleUserEmail: string;
  googleUserName: string;
  googleUserPicture: string;
  encryptionPassword: string;
  enableAutoSync: boolean;
  syncIntervalSeconds: number;
  antigravityDataDir: string;
}

export function getConfig(): AntigravityConfig {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');

  const homeDir = os.homedir();
  const antigravityDataDir = path.join(homeDir, '.gemini', 'antigravity-ide');

  const token = config.get<string>('googleDriveToken', '').trim();
  const refreshToken = config.get<string>('googleRefreshToken', '').trim();
  const fileId = config.get<string>('driveFileId', '').trim();

  return {
    googleDriveToken: token,
    googleRefreshToken: refreshToken,
    driveFileId: fileId,
    googleUserEmail: config.get<string>('googleUserEmail', '').trim(),
    googleUserName: config.get<string>('googleUserName', '').trim(),
    googleUserPicture: config.get<string>('googleUserPicture', '').trim(),
    encryptionPassword: config.get<string>('encryptionPassword', ''),
    enableAutoSync: config.get<boolean>('enableAutoSync', false),
    syncIntervalSeconds: config.get<number>('syncIntervalSeconds', 10),
    antigravityDataDir,
  };
}

export async function setAutoSync(enable: boolean): Promise<void> {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');
  await config.update('enableAutoSync', enable, vscode.ConfigurationTarget.Global);
}

export async function setDriveFileId(driveFileId: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');
  await config.update('driveFileId', driveFileId, vscode.ConfigurationTarget.Global);
}

export async function setGoogleTokens(accessToken: string, refreshToken?: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');
  await config.update('googleDriveToken', accessToken, vscode.ConfigurationTarget.Global);
  if (refreshToken) {
    await config.update('googleRefreshToken', refreshToken, vscode.ConfigurationTarget.Global);
  }
}

export async function setGoogleUserProfile(email: string, name: string, picture: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');
  await config.update('googleUserEmail', email, vscode.ConfigurationTarget.Global);
  await config.update('googleUserName', name, vscode.ConfigurationTarget.Global);
  await config.update('googleUserPicture', picture, vscode.ConfigurationTarget.Global);
}

export async function clearGoogleAuth(): Promise<void> {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');
  await config.update('googleDriveToken', '', vscode.ConfigurationTarget.Global);
  await config.update('googleRefreshToken', '', vscode.ConfigurationTarget.Global);
  await config.update('googleUserEmail', '', vscode.ConfigurationTarget.Global);
  await config.update('googleUserName', '', vscode.ConfigurationTarget.Global);
  await config.update('googleUserPicture', '', vscode.ConfigurationTarget.Global);
  await config.update('driveFileId', '', vscode.ConfigurationTarget.Global);
}

export async function setEncryptionPassword(password: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('antigravityAnywhere');
  await config.update('encryptionPassword', password, vscode.ConfigurationTarget.Global);
}
