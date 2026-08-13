import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getConfig, setDriveFileId, clearGoogleAuth, setAutoSync } from './config';
import { DeltaEngine } from './deltaEngine';
import { encryptPayload, decryptPayload } from './crypto';
import { GoogleDriveStorage } from './storage/googleDriveStorage';
import { GoogleAuthManager } from './googleAuth';
import { SafetyBackup } from './safetyBackup';
import { FileWatcher } from './watcher';

import { DashboardWebview } from './dashboardWebview';
import { SidebarViewProvider } from './sidebarViewProvider';
import { AutoUpdater } from './autoUpdater';

let statusBarItem: vscode.StatusBarItem;
let fileWatcher: FileWatcher | null = null;
let lastManifestHash: string = '';
let activeSyncAbortController: AbortController | null = null;

export function activate(context: vscode.ExtensionContext) {
  // Check for extension updates automatically from GitHub
  AutoUpdater.checkForUpdates(context).catch(() => {});

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'antigravityAnywhere.openDashboard';
  updateStatus('Not Logged In', '$(account)');
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register Sidebar Webview Provider
  const sidebarProvider = new SidebarViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SidebarViewProvider.viewType, sidebarProvider)
  );

  // Check initial token status
  GoogleAuthManager.validateOrRefreshToken().then((isLoggedIn) => {
    if (isLoggedIn) {
      const cfg = getConfig();
      updateStatus(cfg.googleUserName ? `Signed in as ${cfg.googleUserName.split(' ')[0]}` : 'Signed In', '$(cloud-check)');
    } else {
      updateStatus('Not Logged In', '$(account)');
    }
    sidebarProvider.refresh();
    DashboardWebview.refreshCurrentPanel();
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravityAnywhere.googleLogin', async () => {
      try {
        updateStatus('Signing in...', '$(sync~spin)');
        await GoogleAuthManager.startLoginFlow();
        const loggedCfg = getConfig();
        updateStatus(loggedCfg.googleUserName ? `${loggedCfg.googleUserName.split(' ')[0]}` : 'Signed In', '$(cloud-check)');
        vscode.window.showInformationMessage('Antigravity Cloud: Successfully signed in with Google! You can now sync manually.');
        sidebarProvider.refresh();
        DashboardWebview.refreshCurrentPanel();
      } catch (err: any) {
        updateStatus('Login Error', '$(error)');
        vscode.window.showErrorMessage('Antigravity Cloud Google Login Failed: ' + err.message);
      }
    }),
    vscode.commands.registerCommand('antigravityAnywhere.openDashboard', () => DashboardWebview.show(context)),
    vscode.commands.registerCommand('antigravityAnywhere.checkForUpdates', async () => {
      await AutoUpdater.checkForUpdates(context, true);
    }),
    vscode.commands.registerCommand('antigravityAnywhere.cancelSync', () => {
      if (activeSyncAbortController) {
        activeSyncAbortController.abort();
        activeSyncAbortController = null;
        updateStatus('Canceled', '$(x)');
        broadcastProgress(false, 0, '⏹️ Sync canceled by user.', 'Canceled');
        vscode.window.showInformationMessage('Antigravity Cloud: Sync operation canceled by user.');
        sidebarProvider.refresh();
        DashboardWebview.refreshCurrentPanel();
      }
    }),
    vscode.commands.registerCommand('antigravityAnywhere.toggleAutoSync', async () => {
      const cfg = getConfig();
      const newState = !cfg.enableAutoSync;
      await setAutoSync(newState);

      if (newState) {
        if (cfg.googleDriveToken) {
          if (!fileWatcher) {
            fileWatcher = new FileWatcher(cfg.syncIntervalSeconds, () => performSync(false));
          }
          fileWatcher.startWatching(cfg.antigravityDataDir);
        }
        vscode.window.showInformationMessage('Antigravity Cloud: Automatic Sync is now ENABLED ⚡');
      } else {
        if (fileWatcher) {
          fileWatcher.stopWatching();
          fileWatcher = null;
        }
        vscode.window.showInformationMessage('Antigravity Cloud: Automatic Sync is now DISABLED 🛑 (Manual Sync only)');
      }
      sidebarProvider.refresh();
      DashboardWebview.refreshCurrentPanel();
    }),
    vscode.commands.registerCommand('antigravityAnywhere.syncNow', async () => {
      await performSync(true);
      sidebarProvider.refresh();
      DashboardWebview.refreshCurrentPanel();
    }),
    vscode.commands.registerCommand('antigravityAnywhere.restore', async () => {
      await performRestore();
      sidebarProvider.refresh();
      DashboardWebview.refreshCurrentPanel();
    }),
    vscode.commands.registerCommand('antigravityAnywhere.googleLogout', async () => {
      await GoogleAuthManager.logout();
      updateStatus('Not Logged In', '$(account)');
      vscode.window.showInformationMessage('Antigravity Cloud: Signed out of Google.');
      sidebarProvider.refresh();
      DashboardWebview.refreshCurrentPanel();
    }),
    vscode.commands.registerCommand('antigravityAnywhere.deepScan', async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Antigravity Anywhere: Deep Scanning all conversation directories...',
          cancellable: false,
        },
        async () => {
          const config = getConfig();
          const bundle = await DeltaEngine.scanDataDirectory(config.antigravityDataDir);
          const groups = DeltaEngine.groupFilesByConversation(bundle);
          sidebarProvider.refresh();
          vscode.window.showInformationMessage(`Antigravity Anywhere Deep Scan Complete: Found ${groups.length} Conversations (${bundle.files.length} Total Files, ${bundle.totalSizeMB} MB).`);
        }
      );
    }),
    vscode.commands.registerCommand('antigravityAnywhere.deleteConversation', async (convId: string, skipConfirm?: boolean) => {
      if (!convId || convId === 'global-config') return;

      if (!skipConfirm) {
        const confirm = await vscode.window.showWarningMessage(
          `Are you sure you want to delete conversation "${convId}" and all its associated files?`,
          'Yes, Delete Conversation',
          'Cancel'
        );
        if (confirm !== 'Yes, Delete Conversation') return;
      }

      const config = getConfig();
      const candidatePaths = getCandidatePathsForConv(config.antigravityDataDir, convId);

      try {
        let deleted = false;
        for (const candPath of candidatePaths) {
          if (fs.existsSync(candPath)) {
            await fs.promises.rm(candPath, { recursive: true, force: true });
            deleted = true;
          }
        }
        if (deleted) {
          sidebarProvider.refresh();
          DashboardWebview.refreshCurrentPanel();
          vscode.window.showInformationMessage(`Antigravity Anywhere: Deleted conversation ${convId}`);
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Antigravity Anywhere: Failed to delete conversation: ${err.message}`);
      }
    }),
    vscode.commands.registerCommand('antigravityAnywhere.deleteBatchConversations', async (convIds: string[]) => {
      if (!Array.isArray(convIds) || convIds.length === 0) return;

      const config = getConfig();

      for (const convId of convIds) {
        if (!convId) continue;
        const candidatePaths = getCandidatePathsForConv(config.antigravityDataDir, convId);

        for (const candPath of candidatePaths) {
          if (fs.existsSync(candPath)) {
            try {
              await fs.promises.rm(candPath, { recursive: true, force: true });
            } catch {}
          }
        }
      }

      sidebarProvider.refresh();
      DashboardWebview.refreshCurrentPanel();
      vscode.window.showInformationMessage(`Antigravity Anywhere: Successfully deleted ${convIds.length} selected conversation(s).`);
    }),
    vscode.commands.registerCommand('antigravityAnywhere.deleteFile', async (relativePath: string, skipConfirm?: boolean) => {
      if (!relativePath) return;

      if (!skipConfirm) {
        const confirm = await vscode.window.showWarningMessage(
          `Are you sure you want to delete "${relativePath}"?`,
          'Yes, Delete',
          'Cancel'
        );
        if (confirm !== 'Yes, Delete') return;
      }

      const config = getConfig();
      const parentDir = path.dirname(config.antigravityDataDir);
      let targetPath = path.join(config.antigravityDataDir, relativePath);

      if (relativePath.startsWith('config/')) {
        targetPath = path.join(parentDir, relativePath);
      } else if (relativePath.startsWith('app_support/')) {
        const appSupportDir = DeltaEngine.getAppSupportDir();
        targetPath = path.join(appSupportDir, relativePath.substring(12));
      }

      try {
        if (fs.existsSync(targetPath)) {
          await fs.promises.rm(targetPath, { recursive: true, force: true });
          sidebarProvider.refresh();
          DashboardWebview.refreshCurrentPanel();
          vscode.window.showInformationMessage(`Antigravity Anywhere: Deleted ${relativePath}`);
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Antigravity Anywhere: Failed to delete file: ${err.message}`);
      }
    }),
    vscode.commands.registerCommand('antigravityAnywhere.deleteAllFiles', async (skipConfirm?: boolean) => {
      const config = getConfig();

      if (!skipConfirm) {
        const confirm1 = await vscode.window.showWarningMessage(
          '⚠️ DANGER: Are you sure you want to DELETE ALL local conversation files in brain/, conversations/, and implicit/?',
          'Yes, Delete All Files',
          'Cancel'
        );

        if (confirm1 !== 'Yes, Delete All Files') return;

        const confirm2 = await vscode.window.showInputBox({
          prompt: 'Type DELETE to confirm wiping all local conversation files:',
          placeHolder: 'DELETE',
          ignoreFocusOut: true,
        });

        if (confirm2 !== 'DELETE') {
          vscode.window.showInformationMessage('Antigravity Anywhere: Delete All cancelled.');
          return;
        }
      }

      try {
        await SafetyBackup.createSnapshot(config.antigravityDataDir);

        const parentDir = path.dirname(config.antigravityDataDir);
        const appSupportDir = DeltaEngine.getAppSupportDir();

        const dirsToWipe = [
          path.join(config.antigravityDataDir, 'brain'),
          path.join(config.antigravityDataDir, 'conversations'),
          path.join(config.antigravityDataDir, 'implicit'),
          path.join(parentDir, 'antigravity', 'brain'),
          path.join(parentDir, 'antigravity', 'conversations'),
          path.join(parentDir, 'antigravity', 'implicit'),
          path.join(parentDir, 'antigravity-ide', 'brain'),
          path.join(parentDir, 'antigravity-ide', 'conversations'),
          path.join(parentDir, 'antigravity-ide', 'implicit'),
          path.join(appSupportDir, 'shared_proto_db'),
        ];

        for (const dir of dirsToWipe) {
          if (fs.existsSync(dir)) {
            await fs.promises.rm(dir, { recursive: true, force: true });
          }
        }

        const cacheFile = DeltaEngine.getCacheFilePath(config.antigravityDataDir);
        if (fs.existsSync(cacheFile)) {
          await fs.promises.unlink(cacheFile);
        }

        sidebarProvider.refresh();
        DashboardWebview.refreshCurrentPanel();
        vscode.window.showInformationMessage('Antigravity Anywhere: All local conversation files wiped (safety snapshot created).');
      } catch (err: any) {
        vscode.window.showErrorMessage(`Antigravity Anywhere: Delete All failed: ${err.message}`);
      }
    })
  );

  // Setup auto sync watcher
  const config = getConfig();
  if (config.enableAutoSync && config.googleDriveToken) {
    fileWatcher = new FileWatcher(config.syncIntervalSeconds, () => performSync(false));
    fileWatcher.startWatching(config.antigravityDataDir);
  }

  // Re-setup watcher on config change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('antigravityAnywhere')) {
        setupWatcher();
      }
    })
  );
}

function setupWatcher(): void {
  if (fileWatcher) {
    fileWatcher.stopWatching();
    fileWatcher = null;
  }

  const config = getConfig();
  if (config.enableAutoSync && config.googleDriveToken) {
    fileWatcher = new FileWatcher(config.syncIntervalSeconds, () => performSync(false));
    fileWatcher.startWatching(config.antigravityDataDir);
  }
}

function broadcastProgress(active: boolean, percentage: number, statusText: string, title: string = '🚀 Syncing to Google Drive...'): void {
  const message = {
    command: 'syncProgress',
    progress: { active, percentage, statusText, title }
  };
  if (DashboardWebview.currentPanel) {
    DashboardWebview.currentPanel.webview.postMessage(message);
  }
  if (SidebarViewProvider.currentView) {
    SidebarViewProvider.currentView.webview.postMessage(message);
  }
}

async function performSync(interactive: boolean = false): Promise<void> {
  const config = getConfig();

  if (!config.googleDriveToken) {
    if (interactive) {
      vscode.window.showWarningMessage('Antigravity Anywhere: Please sign in with Google first.', 'Sign In').then((choice) => {
        if (choice === 'Sign In') vscode.commands.executeCommand('antigravityAnywhere.googleLogin');
      });
    }
    return;
  }

  activeSyncAbortController = new AbortController();

  const runSync = async () => {
    try {
      updateStatus('Syncing...', '$(sync~spin)');
      broadcastProgress(true, 10, '🔍 Scanning local chat transcripts & databases... (Do not close Antigravity IDE)', '🚀 Syncing to Google Drive...');

      // Full unlimited Google Drive sync (15GB limit)
      const bundle = await DeltaEngine.scanForSync(config.antigravityDataDir);

      if (activeSyncAbortController?.signal.aborted) throw new Error('Operation canceled by user.');

      if (bundle.files.length === 0) {
        if (interactive) vscode.window.showInformationMessage('Antigravity Anywhere: No chat data found to sync.');
        updateStatus('Idle', '$(cloud-check)');
        broadcastProgress(false, 0, '');
        return;
      }

      if (bundle.manifestHash === lastManifestHash) {
        updateStatus('Up to Date', '$(cloud-check)');
        broadcastProgress(true, 100, '⚡ Already Up to Date! No changes detected since last sync.', '🚀 Up to Date');
        if (interactive) {
          vscode.window.showInformationMessage(`Antigravity Anywhere: Cloud backup is already up-to-date! All ${bundle.files.length} conversation files match Google Drive.`);
        }
        return;
      }

      broadcastProgress(true, 30, `⚡ Processing ${bundle.files.length} chat files (${bundle.totalSizeMB} MB)...`, '🚀 Syncing to Google Drive...');

      const payloadJson = JSON.stringify(bundle);

      if (activeSyncAbortController?.signal.aborted) throw new Error('Operation canceled by user.');

      broadcastProgress(true, 55, '🔒 Compressing & Encrypting payload (AES-256-GCM)...', '🚀 Syncing to Google Drive...');
      const encryptedPayload = encryptPayload(payloadJson, config.encryptionPassword);

      if (activeSyncAbortController?.signal.aborted) throw new Error('Operation canceled by user.');

      broadcastProgress(true, 75, `☁️ Uploading encrypted bundle (${(encryptedPayload.length / (1024 * 1024)).toFixed(2)} MB) to Google Drive... Please wait...`, '🚀 Syncing to Google Drive...');

      const storage = new GoogleDriveStorage(config.googleDriveToken, activeSyncAbortController?.signal);
      let targetFileId = config.driveFileId;

      if (!targetFileId) {
        const existingId = await storage.findBackupFileId();
        if (existingId) {
          targetFileId = existingId;
        }
      }

      const fileId = await storage.uploadSyncPayload(
        encryptedPayload,
        targetFileId,
        (uploaded, total) => {
          const percent = Math.min(89, Math.floor(75 + (uploaded / total) * 14));
          const uploadedMB = (uploaded / (1024 * 1024)).toFixed(1);
          const totalMB = (total / (1024 * 1024)).toFixed(1);
          broadcastProgress(
            true,
            percent,
            `☁️ Uploading: ${uploadedMB} MB / ${totalMB} MB (${percent}%)... Please wait...`,
            '🚀 Uploading to Google Drive...'
          );
        }
      );

      if (fileId !== config.driveFileId) {
        await setDriveFileId(fileId);
      }

      broadcastProgress(true, 90, '💾 Saving local delta state cache...', '🚀 Syncing to Google Drive...');
      // Save incremental delta state cache
      await DeltaEngine.saveDeltaState(config.antigravityDataDir, bundle.files);

      lastManifestHash = bundle.manifestHash;
      updateStatus('Synced', '$(cloud-check)');
      broadcastProgress(true, 100, `✅ Synced ${bundle.files.length} chat files (${bundle.totalSizeMB} MB) to Google Drive!`, '🚀 Sync Complete');

      if (interactive) {
        const groups = DeltaEngine.groupFilesByConversation(bundle);
        const modeLabel = bundle.isIncremental ? '⚡ Incremental Delta Sync' : '🔄 Full Backup Sync';
        vscode.window.showInformationMessage(`Antigravity Anywhere [${modeLabel}]: Synced ${groups.length} active/modified chats (${bundle.files.length} files, ${bundle.totalSizeMB} MB) to Google Drive!`);
      }
    } catch (err: any) {
      updateStatus('Sync Error', '$(error)');
      broadcastProgress(true, 0, `❌ Sync Failed: ${err.message}`, 'Sync Error');
      if (interactive && !activeSyncAbortController?.signal.aborted) {
        if (err.message && err.message.includes('console.developers.google.com')) {
          vscode.window.showErrorMessage(
            `Antigravity Cloud: Google Drive API is disabled in your Google Cloud Project (627024998523). Click below to enable it.`,
            'Enable Google Drive API'
          ).then((choice) => {
            if (choice === 'Enable Google Drive API') {
              vscode.env.openExternal(vscode.Uri.parse('https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=627024998523'));
            }
          });
        } else {
          vscode.window.showErrorMessage(`Antigravity Anywhere Google Drive Sync Failed: ${err.message}`);
        }
      }
    } finally {
      activeSyncAbortController = null;
    }
  };

  if (interactive) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Antigravity Anywhere: Syncing all conversations to Google Drive...',
        cancellable: false,
      },
      runSync
    );
  } else {
    await runSync();
  }
}

async function performRestore(): Promise<void> {
  const config = getConfig();

  if (!config.googleDriveToken) {
    vscode.window.showErrorMessage('Antigravity Anywhere: Google Sign-In is required to restore backups.', 'Sign In').then((choice) => {
      if (choice === 'Sign In') vscode.commands.executeCommand('antigravityAnywhere.googleLogin');
    });
    return;
  }

  activeSyncAbortController = new AbortController();

  const storage = new GoogleDriveStorage(config.googleDriveToken, activeSyncAbortController.signal);
  let fileId = config.driveFileId;

  if (!fileId) {
    updateStatus('Searching Google Drive...', '$(sync~spin)');
    broadcastProgress(true, 10, '🔍 Searching Google Drive for backup file...', '📥 Restoring from Google Drive...');
    const foundFileId = await storage.findBackupFileId();
    if (foundFileId) {
      fileId = foundFileId;
      await setDriveFileId(fileId);
    } else {
      updateStatus('Restore Error', '$(error)');
      broadcastProgress(true, 0, '❌ No backup found on Google Drive', 'Restore Error');
      vscode.window.showErrorMessage('Antigravity Anywhere: No cloud backup found in Google Drive account. Perform a Sync first on your main computer.');
      activeSyncAbortController = null;
      return;
    }
  }

  const confirm = await vscode.window.showWarningMessage(
    'Restoring from Google Drive will update local chat history and SQLite databases. A local backup snapshot will be created automatically. Proceed?',
    'Yes, Restore',
    'Cancel'
  );

  if (confirm !== 'Yes, Restore') {
    updateStatus('Idle', '$(cloud-check)');
    activeSyncAbortController = null;
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Antigravity Anywhere: Restoring all conversations from Google Drive...',
      cancellable: false,
    },
    async () => {
      try {
        updateStatus('Restoring...', '$(sync~spin)');
        broadcastProgress(true, 20, '📸 Creating Safety Snapshot local backup...', '📥 Restoring from Google Drive...');

        await SafetyBackup.createSnapshot(config.antigravityDataDir);

        broadcastProgress(true, 45, '☁️ Downloading encrypted payload from Google Drive...', '📥 Restoring from Google Drive...');
        const encryptedPayload = await storage.downloadSyncPayload(fileId);

        broadcastProgress(true, 70, '🔓 Decrypting payload & uncompressing files...', '📥 Restoring from Google Drive...');
        const decryptedJson = decryptPayload(encryptedPayload, config.encryptionPassword);
        const bundle = JSON.parse(decryptedJson);

        broadcastProgress(true, 85, `📁 Restoring ${bundle.files?.length || 0} transcript files and databases to disk...`, '📥 Restoring from Google Drive...');
        const restoredCount = await DeltaEngine.restoreBundle(config.antigravityDataDir, bundle);

        updateStatus('Restored', '$(cloud-check)');
        broadcastProgress(true, 100, `✅ Restored ${restoredCount} chat files! ⚠️ Please Quit & Restart Antigravity IDE (Cmd+Q) to reload history.`, '📥 Restore Complete (Restart App)');
        
        // 1-Click Quit / Restart Notification Prompt
        vscode.window.showInformationMessage(
          `Antigravity Cloud: Successfully restored ${restoredCount} conversation & database files! Please Quit & Restart Antigravity IDE to reload SQLite chat history.`,
          '🚪 Quit Antigravity',
          '🔄 Reload Window',
          'Later'
        ).then((choice) => {
          if (choice === '🚪 Quit Antigravity') {
            vscode.commands.executeCommand('workbench.action.quit');
          } else if (choice === '🔄 Reload Window') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          }
        });
      } catch (err: any) {
        updateStatus('Restore Error', '$(error)');
        broadcastProgress(true, 0, `❌ Restore Failed: ${err.message}`, 'Restore Error');
        vscode.window.showErrorMessage(`Antigravity Anywhere Google Drive Restore Failed: ${err.message}`);
      } finally {
        activeSyncAbortController = null;
      }
    }
  );
}



function getCandidatePathsForConv(antigravityDataDir: string, convId: string): string[] {
  const parentDir = path.dirname(antigravityDataDir);
  const appSupportDir = DeltaEngine.getAppSupportDir();

  if (convId === 'global-config') {
    return [
      path.join(antigravityDataDir, 'config'),
      path.join(antigravityDataDir, 'state.vscdb'),
      path.join(antigravityDataDir, 'state.vscdb.backup'),
      path.join(parentDir, 'antigravity', 'config'),
      path.join(parentDir, 'antigravity-ide', 'config'),
      path.join(appSupportDir, 'shared_proto_db'),
    ];
  }

  const bases = [
    antigravityDataDir,
    path.join(parentDir, 'antigravity'),
    path.join(parentDir, 'antigravity-ide'),
  ];

  const candidatePaths: string[] = [];
  for (const base of bases) {
    candidatePaths.push(
      path.join(base, 'brain', convId),
      path.join(base, 'conversations', `${convId}.db`),
      path.join(base, 'conversations', `${convId}.db-wal`),
      path.join(base, 'conversations', `${convId}.db-shm`),
      path.join(base, 'implicit', `${convId}.pb`)
    );
  }
  return candidatePaths;
}

function updateStatus(text: string, icon: string): void {
  if (statusBarItem) {
    statusBarItem.text = `${icon} Antigravity: ${text}`;
  }
}

export function deactivate() {
  if (fileWatcher) {
    fileWatcher.stopWatching();
  }
}
