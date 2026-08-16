import * as vscode from 'vscode';
import { getConfig } from './config';
import { DeltaEngine } from './deltaEngine';
import { DeviceManager } from './deviceManager';

export class SidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'antigravityAnywhereSidebarView';
  public static currentView?: vscode.WebviewView;
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    SidebarViewProvider.currentView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'googleLogin':
          await vscode.commands.executeCommand('antigravityAnywhere.googleLogin');
          this.refresh();
          break;
        case 'googleLogout':
          await vscode.commands.executeCommand('antigravityAnywhere.googleLogout');
          this.refresh();
          break;
        case 'deepScan':
          await vscode.commands.executeCommand('antigravityAnywhere.deepScan');
          this.refresh();
          break;
        case 'syncNow':
          await vscode.commands.executeCommand('antigravityAnywhere.syncNow');
          this.refresh();
          break;
        case 'restore':
          await vscode.commands.executeCommand('antigravityAnywhere.restore');
          this.refresh();
          break;
        case 'deleteAll':
          await vscode.commands.executeCommand('antigravityAnywhere.deleteAllFiles', true);
          this.refresh();
          break;
        case 'deleteFile':
          await vscode.commands.executeCommand('antigravityAnywhere.deleteFile', data.relativePath);
          this.refresh();
          break;
        case 'deleteConversation':
          await vscode.commands.executeCommand('antigravityAnywhere.deleteConversation', data.convId);
          this.refresh();
          break;
        case 'openDashboard':
          await vscode.commands.executeCommand('antigravityAnywhere.openDashboard');
          break;
        case 'cancelSync':
          await vscode.commands.executeCommand('antigravityAnywhere.cancelSync');
          this.refresh();
          break;
        case 'toggleAutoSync':
          await vscode.commands.executeCommand('antigravityAnywhere.toggleAutoSync');
          this.refresh();
          break;
        case 'openGithubStar':
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/quantEray/antigravity-cloud'));
          break;
        case 'openGithubIssues':
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/quantEray/antigravity-cloud/issues'));
          break;
        case 'setEncryptionPassword':
          await vscode.commands.executeCommand('antigravityAnywhere.setEncryptionPassword');
          this.refresh();
          break;
        case 'refresh':
          this.refresh();
          break;
      }
    });

    this.refresh();
  }

  public async refresh() {
    if (!this._view) return;
    this._view.webview.html = await this._getHtmlForWebview();
  }

  private async _getHtmlForWebview(): Promise<string> {
    const config = getConfig();
    const currentDevice = DeviceManager.getDeviceInfo();
    let convCount = 0;
    let totalSizeMB = '0';
    let convListHtml = '';

    try {
      const bundle = await DeltaEngine.scanDataDirectory(config.antigravityDataDir);
      totalSizeMB = bundle.totalSizeMB;
      const groups = DeltaEngine.groupFilesByConversation(bundle, config.antigravityDataDir);
      convCount = groups.length;

      convListHtml = groups
        .map(
          (g) => {
            const statusIcon = g.status === 'synced' ? '🟢' : g.status === 'modified' ? '🟡' : '⚪';
            return `<div class="conv-item">
              <div class="conv-header">
                <div class="conv-title">${statusIcon} ${g.title}</div>
                <button class="btn-del-mini" onclick="send('deleteConversation', '${g.id}')" title="Delete conversation">🗑️</button>
              </div>
              <div class="conv-meta">ID: ${g.id.substring(0, 8)}... • ${g.files.length} Files (${g.totalSizeMB} MB)</div>
            </div>`;
          }
        )
        .join('');
    } catch {
      convListHtml = '<div class="conv-item empty">No chat data found.</div>';
    }

    const isLoggedIn = Boolean(config.googleDriveToken);
    const userEmail = config.googleUserEmail || 'Google User';
    const userName = config.googleUserName || userEmail;
    const userPicture = config.googleUserPicture || '';

    const avatarHtml = userPicture
      ? `<img src="${userPicture}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`
      : `<div class="user-avatar-fallback">👤</div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Anywhere</title>
  <style>
    body {
      font-family: var(--vscode-font-family, system-ui, sans-serif);
      color: var(--vscode-foreground);
      padding: 12px;
      margin: 0;
      font-size: 12px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-widget-border, #333);
    }
    .title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      background: ${isLoggedIn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
      border: 1px solid ${isLoggedIn ? '#10b981' : '#ef4444'};
      color: ${isLoggedIn ? '#34d399' : '#f87171'};
      font-weight: 600;
    }
    .user-card {
      background: var(--vscode-sideBar-background, #1e1e2e);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
    }
    .user-avatar-fallback {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .user-details {
      flex: 1;
      overflow: hidden;
    }
    .user-name {
      font-weight: 700;
      font-size: 12px;
      color: var(--vscode-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 10px;
      opacity: 0.65;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Progress Bar Widget */
    .progress-card {
      display: none;
      background: rgba(30, 27, 60, 0.9);
      border: 1px solid #8b5cf6;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 12px;
      flex-direction: column;
      gap: 6px;
    }
    .progress-card.active {
      display: flex;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
    }
    .progress-title {
      color: #fff;
    }
    .progress-percent {
      color: #a855f7;
      font-family: monospace;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
      border-radius: 6px;
      transition: width 0.3s ease;
    }
    .progress-status {
      font-size: 10px;
      opacity: 0.8;
      color: #cbd5e1;
    }
    .btn-cancel-sync {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #f87171;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 4px;
      width: 100%;
    }
    .btn-cancel-sync:hover {
      background: #ef4444;
      color: #fff;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    button.btn-dashboard {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }
    button.btn-dashboard:hover {
      background: linear-gradient(135deg, #4f46e5, #9333ea);
    }
    button {
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      padding: 7px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.2s;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground, #1177bb);
    }
    button.login {
      background: #10b981;
      color: #fff;
    }
    button.login:hover {
      background: #059669;
    }
    button.logout {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    button.logout:hover {
      background: #ef4444;
      color: #fff;
    }
    button.scan {
      background: #8b5cf6;
      color: #fff;
    }
    button.scan:hover {
      background: #7c3aed;
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #ffffff);
    }
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground, #45494e);
    }
    button.danger {
      background: #dc2626;
      color: #ffffff;
      margin-top: 4px;
    }
    button.danger:hover {
      background: #b91c1c;
    }
    .stats-card {
      background: var(--vscode-sideBar-background, #252526);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 14px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
    }
    .stat-row:last-child {
      margin-bottom: 0;
    }
    .stat-label {
      opacity: 0.7;
    }
    .stat-val {
      font-weight: 600;
      color: var(--vscode-symbolIcon-keywordForeground, #75beff);
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .conv-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .conv-item {
      background: var(--vscode-sideBar-background, #252526);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 6px;
      padding: 8px 10px;
    }
    .conv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .conv-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 170px;
    }
    .conv-meta {
      font-size: 10px;
      opacity: 0.6;
      font-family: monospace;
    }
    .btn-del-mini {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 12px;
      opacity: 0.7;
    }
    .btn-del-mini:hover {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">☁️ Antigravity Drive</div>
    <div class="badge">${isLoggedIn ? 'Connected' : 'Not Connected'}</div>
  </div>

  ${
    isLoggedIn
      ? `<div class="user-card">
          ${avatarHtml}
          <div class="user-details">
            <div class="user-name">${userName}</div>
            <div class="user-email">${userEmail}</div>
          </div>
        </div>`
      : ''
  }

  <div class="progress-card" id="progressCard">
    <div class="progress-header">
      <div class="progress-title" id="progressTitle">🚀 Syncing...</div>
      <div class="progress-percent" id="progressPercent">0%</div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <div class="progress-status" id="progressStatus">Initializing...</div>
    <button class="btn-cancel-sync" onclick="send('cancelSync')">⏹️ Cancel Sync</button>
  </div>

  <div class="actions">
    <button class="btn-dashboard" onclick="send('openDashboard')">🖥️ Open Full Dashboard</button>
    <button class="${config.enableAutoSync ? 'scan' : 'secondary'}" onclick="send('toggleAutoSync')">⚡ Auto Sync: ${config.enableAutoSync ? 'ON' : 'OFF'}</button>
    ${
      isLoggedIn
        ? `<button class="logout" onclick="send('googleLogout')">🚪 Sign Out (${userName.split(' ')[0]})</button>`
        : `<button class="login" onclick="send('googleLogin')">🔑 Sign in with Google</button>`
    }
    <button class="scan" onclick="send('deepScan')">🔍 Deep Scan & Re-Index</button>
    <button onclick="send('syncNow')">⚡ Sync All (Google Drive)</button>
    <button class="secondary" onclick="send('restore')">📥 Restore from Google Drive</button>
    <button class="secondary" onclick="send('refresh')">🔄 Refresh UI</button>
    <div style="display: flex; gap: 6px; width: 100%;">
      <button class="secondary" onclick="send('openGithubStar')" style="flex: 1; font-size: 11px; padding: 6px;" title="Star on GitHub">⭐ Star Project</button>
      <button class="secondary" onclick="send('openGithubIssues')" style="flex: 1; font-size: 11px; padding: 6px;" title="Report Feedback">💬 Feedback</button>
    </div>
    <button class="danger" onclick="send('deleteAll')">🗑️ Delete All Files</button>
  </div>

  <div class="stats-card">
    <div class="stat-row">
      <span class="stat-label">Device:</span>
      <span class="stat-val">${currentDevice.deviceName}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Active Chats:</span>
      <span class="stat-val">${convCount}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Total Size:</span>
      <span class="stat-val">${totalSizeMB} MB</span>
    </div>
  </div>

  <div class="section-title">Conversations (${convCount})</div>
  <div class="conv-list">
    ${convListHtml}
  </div>

  <script>
    const vscode = (window.vscodeApi = window.vscodeApi || acquireVsCodeApi());
    function send(command, param) {
      if (command === 'deleteConversation') {
        vscode.postMessage({ command: 'deleteConversation', convId: param });
      } else {
        vscode.postMessage({ command });
      }
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'syncProgress') {
        const { active, percentage, statusText, title } = message.progress;
        const card = document.getElementById('progressCard');
        const fill = document.getElementById('progressFill');
        const percent = document.getElementById('progressPercent');
        const status = document.getElementById('progressStatus');
        const titleEl = document.getElementById('progressTitle');

        if (card && active) {
          card.classList.add('active');
          if (fill) fill.style.width = percentage + '%';
          if (percent) percent.innerText = percentage + '%';
          if (status) status.innerText = statusText;
          if (titleEl) titleEl.innerText = title;

          if (percentage >= 100) {
            setTimeout(() => {
              card.classList.remove('active');
            }, 3500);
          }
        } else if (card) {
          card.classList.remove('active');
        }
      }
    });
  </script>
</body>
</html>`;
  }
}
