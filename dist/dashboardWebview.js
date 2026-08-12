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
exports.DashboardWebview = void 0;
const vscode = __importStar(require("vscode"));
const config_1 = require("./config");
const deltaEngine_1 = require("./deltaEngine");
const deviceManager_1 = require("./deviceManager");
class DashboardWebview {
    static currentPanel;
    static show(context) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (DashboardWebview.currentPanel) {
            DashboardWebview.currentPanel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('antigravityAnywhereDashboard', '☁️ Antigravity Cloud Hub', column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        DashboardWebview.currentPanel = panel;
        panel.onDidDispose(() => {
            DashboardWebview.currentPanel = undefined;
        }, null, context.subscriptions);
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'googleLogin':
                    await vscode.commands.executeCommand('antigravityAnywhere.googleLogin');
                    this.updateWebviewHtml(panel);
                    break;
                case 'googleLogout':
                    await vscode.commands.executeCommand('antigravityAnywhere.googleLogout');
                    this.updateWebviewHtml(panel);
                    break;
                case 'deepScan':
                    await vscode.commands.executeCommand('antigravityAnywhere.deepScan');
                    this.updateWebviewHtml(panel);
                    break;
                case 'syncNow':
                    await vscode.commands.executeCommand('antigravityAnywhere.syncNow');
                    this.updateWebviewHtml(panel);
                    break;
                case 'restore':
                    await vscode.commands.executeCommand('antigravityAnywhere.restore');
                    this.updateWebviewHtml(panel);
                    break;
                case 'deleteAll':
                    await vscode.commands.executeCommand('antigravityAnywhere.deleteAllFiles');
                    this.updateWebviewHtml(panel);
                    break;
                case 'deleteFile':
                    await vscode.commands.executeCommand('antigravityAnywhere.deleteFile', message.relativePath, true);
                    this.updateWebviewHtml(panel);
                    break;
                case 'deleteConversation':
                    await vscode.commands.executeCommand('antigravityAnywhere.deleteConversation', message.convId, true);
                    this.updateWebviewHtml(panel);
                    break;
                case 'deleteBatchConversations':
                    await vscode.commands.executeCommand('antigravityAnywhere.deleteBatchConversations', message.convIds);
                    this.updateWebviewHtml(panel);
                    break;
                case 'refresh':
                    this.updateWebviewHtml(panel);
                    break;
            }
        }, undefined, context.subscriptions);
        this.updateWebviewHtml(panel);
    }
    static refreshCurrentPanel() {
        if (DashboardWebview.currentPanel) {
            DashboardWebview.updateWebviewHtml(DashboardWebview.currentPanel);
        }
    }
    static async updateWebviewHtml(panel) {
        const config = (0, config_1.getConfig)();
        const currentDevice = deviceManager_1.DeviceManager.getDeviceInfo();
        let fileCount = 0;
        let convCount = 0;
        let totalSizeMB = '0';
        let convListHtml = '';
        try {
            const bundle = await deltaEngine_1.DeltaEngine.scanDataDirectory(config.antigravityDataDir);
            fileCount = bundle.files.length;
            totalSizeMB = bundle.totalSizeMB;
            const groups = deltaEngine_1.DeltaEngine.groupFilesByConversation(bundle);
            convCount = groups.length;
            convListHtml = groups
                .map((g, idx) => {
                const filesHtml = g.files
                    .map((f) => `<div class="sub-file-item">
                <span class="sub-file-name">📄 ${f.relativePath}</span>
                <span class="sub-file-size">${(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                <button class="btn-sub-del" onclick="confirmDeleteFile('${f.relativePath}')" title="Delete file">🗑️</button>
              </div>`)
                    .join('');
                const cleanTitle = g.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                const convIdShort = g.id.substring(0, 12);
                return `<div class="conv-card" data-title="${cleanTitle.toLowerCase()}" data-id="${g.id}">
            <div class="conv-header">
              <div class="conv-info">
                <div class="conv-title-row">
                  <input type="checkbox" class="conv-checkbox" data-id="${g.id}" onchange="updateBatchState()">
                  <div class="conv-title">💬 ${cleanTitle}</div>
                </div>
                <div class="conv-sub">
                  ID: ${convIdShort}... • ${g.files.length} Files (${g.totalSizeMB} MB) • Updated: ${g.lastUpdated}
                </div>
              </div>
              <div class="conv-actions">
                <button class="btn-toggle-files" onclick="toggleFiles('files_${idx}')">▶ Files (${g.files.length})</button>
                <button class="btn-del-conv" onclick="confirmDeleteConv('${g.id}', '${cleanTitle}')" title="Delete chat">🗑️ Delete Chat</button>
              </div>
            </div>
            <div class="conv-files" id="files_${idx}">
              ${filesHtml}
            </div>
          </div>`;
            })
                .join('');
        }
        catch {
            convListHtml = '<div class="empty-state">No conversation files found. Click "Deep Scan & Re-Index".</div>';
        }
        const isLoggedIn = Boolean(config.googleDriveToken);
        const userEmail = config.googleUserEmail || '';
        const userName = config.googleUserName || userEmail || 'Google User';
        const userPicture = config.googleUserPicture || '';
        const avatarHtml = userPicture
            ? `<img src="${userPicture}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`
            : `<div class="user-avatar-fallback">👤</div>`;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Cloud Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0d17;
      --card-bg: rgba(22, 26, 44, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --gradient-primary: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
      --gradient-login: linear-gradient(135deg, #10b981 0%, #059669 100%);
      --gradient-scan: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
      --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 32px;
      margin: 0;
      box-sizing: border-box;
    }
    .hero {
      background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 45%),
                  radial-gradient(circle at top right, rgba(168, 85, 247, 0.18), transparent 45%);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 24px 32px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .title-box h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title-box p {
      margin: 0;
      font-size: 14px;
      color: var(--text-muted);
    }
    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(22, 26, 44, 0.9);
      border: 1px solid ${isLoggedIn ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
      padding: 10px 18px;
      border-radius: 16px;
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
    }
    .user-avatar-fallback {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .user-meta-name {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    .user-meta-email {
      font-size: 12px;
      color: var(--text-muted);
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: ${isLoggedIn ? '#34d399' : '#f87171'};
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${isLoggedIn ? '#34d399' : '#f87171'};
      box-shadow: 0 0 10px ${isLoggedIn ? '#34d399' : '#f87171'};
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }
    .action-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 22px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    }
    .btn-login {
      background: var(--gradient-login);
      color: #ffffff;
      font-size: 14px;
    }
    .btn-logout {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    .btn-logout:hover {
      background: #ef4444;
      color: #ffffff;
    }
    .btn-scan {
      background: var(--gradient-scan);
      color: #ffffff;
    }
    .btn-primary {
      background: var(--gradient-primary);
      color: #ffffff;
    }
    .btn-secondary {
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--card-border);
    }
    .btn-danger {
      background: var(--gradient-danger);
      color: #ffffff;
      margin-left: auto;
    }
    .device-section {
      margin-bottom: 28px;
    }
    .device-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 20px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(12px);
    }
    .device-info-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .device-icon {
      font-size: 28px;
      background: rgba(99, 102, 241, 0.15);
      padding: 12px;
      border-radius: 14px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .device-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .device-sub {
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 20px;
      border-radius: 16px;
      backdrop-filter: blur(12px);
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
    }
    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }
    .search-input {
      flex: 1;
      padding: 14px 20px;
      border-radius: 12px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent-purple);
    }
    .batch-bar {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn-batch-del {
      background: var(--gradient-danger);
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      opacity: 0.5;
      pointer-events: none;
      transition: all 0.2s;
    }
    .btn-batch-del.active {
      opacity: 1;
      pointer-events: auto;
    }
    .conv-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .conv-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      transition: border-color 0.2s;
    }
    .conv-card:hover {
      border-color: rgba(168, 85, 247, 0.4);
    }
    .conv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .conv-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .conv-checkbox {
      width: 18px;
      height: 18px;
      accent-color: #8b5cf6;
      cursor: pointer;
    }
    .conv-title {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
    }
    .conv-sub {
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
      margin-top: 4px;
      margin-left: 30px;
    }
    .conv-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn-toggle-files {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-toggle-files:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text);
    }
    .btn-del-conv {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-del-conv:hover {
      background: #ef4444;
      color: #fff;
    }
    .conv-files {
      display: none;
      flex-direction: column;
      gap: 8px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed var(--card-border);
      margin-left: 30px;
    }
    .sub-file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(11, 13, 23, 0.6);
      border-radius: 8px;
      font-size: 13px;
      font-family: monospace;
    }
    .sub-file-size {
      opacity: 0.6;
      font-size: 11px;
    }
    .btn-sub-del {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .btn-sub-del:hover {
      opacity: 1;
    }

    /* Modal System */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(8px);
      z-index: 999;
      justify-content: center;
      align-items: center;
    }
    .modal-card {
      background: #161a2c;
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    .modal-icon {
      font-size: 44px;
      margin-bottom: 16px;
    }
    .modal-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .modal-desc {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .modal-btn-cancel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .modal-btn-confirm {
      background: var(--gradient-danger);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div class="hero">
    <div class="title-box">
      <h1>☁️ Antigravity Cloud Hub</h1>
      <p>Multi-Device State Manager & Real-Time Sync Engine (Google Drive Backend)</p>
    </div>
    
    <div class="user-profile-badge">
      ${isLoggedIn
            ? `${avatarHtml}
             <div>
               <div class="user-meta-name">${userName}</div>
               <div class="user-meta-email">${userEmail}</div>
               <div class="status-badge"><span class="pulse-dot"></span> Google Drive Connected</div>
             </div>`
            : `<div class="status-badge"><span class="pulse-dot"></span> Not Logged In</div>`}
    </div>
  </div>

  <div class="action-bar">
    ${isLoggedIn
            ? `<button class="btn btn-logout" onclick="sendMessage('googleLogout')">🚪 Sign Out (${userName.split(' ')[0]})</button>`
            : `<button class="btn btn-login" onclick="sendMessage('googleLogin')">🔑 Sign in with Google (1-Click Login)</button>`}
    <button class="btn btn-scan" onclick="sendMessage('deepScan')">🔍 Deep Scan & Re-Index</button>
    <button class="btn btn-primary" onclick="sendMessage('syncNow')">⚡ Sync All Conversations (Push)</button>
    <button class="btn btn-secondary" onclick="sendMessage('restore')">📥 Restore from Google Drive (Pull)</button>
    <button class="btn btn-danger" onclick="confirmDeleteAll()">🗑️ Delete All Local Files</button>
  </div>

  <div class="device-section">
    <div class="device-card">
      <div class="device-info-box">
        <div class="device-icon">${currentDevice.platform === 'mac' ? '💻' : (currentDevice.platform === 'windows' ? '🖥️' : '🐧')}</div>
        <div>
          <div class="device-name">${currentDevice.deviceName}</div>
          <div class="device-sub">Device ID: ${currentDevice.deviceId} • OS: ${currentDevice.osRelease}</div>
        </div>
      </div>
      <div class="status-badge" style="font-size: 12px; padding: 4px 12px;">
        <span class="pulse-dot"></span> This Device (Active)
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card stat-card">
      <div class="stat-label">Active Conversations</div>
      <div class="stat-val">${convCount} Chats</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Total Data Size</div>
      <div class="stat-val">${totalSizeMB} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Cloud Storage Quota</div>
      <div class="stat-val">15 GB (Google Drive)</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Zero-Knowledge Security</div>
      <div class="stat-val">${config.encryptionPassword ? 'AES-256-GCM + Gzip' : 'Gzip Standard'}</div>
    </div>
  </div>

  <div class="search-bar">
    <input type="text" id="searchInput" class="search-input" placeholder="🔍 Search conversations by title or ID..." onkeyup="filterConversations()">
    <div class="batch-bar">
      <button class="btn btn-secondary" onclick="selectAllConvs(true)">☑️ Select All</button>
      <button class="btn btn-secondary" onclick="selectAllConvs(false)">☐ Clear</button>
      <button class="btn-batch-del" id="batchDelBtn" onclick="confirmBatchDelete()">🗑️ Delete Selected (<span id="selectedCount">0</span>)</button>
    </div>
  </div>

  <div class="conv-list" id="convList">
    ${convListHtml}
  </div>

  <!-- Custom Glassmorphism Confirmation Modal -->
  <div class="modal-overlay" id="confirmModal">
    <div class="modal-card">
      <div class="modal-icon" id="modalIcon">⚠️</div>
      <div class="modal-title" id="modalTitle">Confirm Action</div>
      <div class="modal-desc" id="modalDesc">Are you sure you want to proceed?</div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="modal-btn-confirm" id="modalConfirmBtn">Confirm Delete</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = (window.vscodeApi = window.vscodeApi || acquireVsCodeApi());

    function sendMessage(command) {
      vscode.postMessage({ command });
    }

    function toggleFiles(id) {
      const el = document.getElementById(id);
      if (el) {
        const isHidden = el.style.display === 'none' || !el.style.display;
        el.style.display = isHidden ? 'flex' : 'none';
      }
    }

    function filterConversations() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const cards = document.querySelectorAll('.conv-card');
      cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const id = card.getAttribute('data-id') || '';
        if (title.includes(q) || id.includes(q)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function updateBatchState() {
      const checked = document.querySelectorAll('.conv-checkbox:checked');
      const count = checked.length;
      document.getElementById('selectedCount').innerText = count;
      const btn = document.getElementById('batchDelBtn');
      if (count > 0) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    function selectAllConvs(state) {
      const checkboxes = document.querySelectorAll('.conv-checkbox');
      checkboxes.forEach(cb => {
        if (cb.closest('.conv-card').style.display !== 'none') {
          cb.checked = state;
        }
      });
      updateBatchState();
    }

    let pendingAction = null;

    function openModal(icon, title, desc, onConfirm) {
      document.getElementById('modalIcon').innerText = icon;
      document.getElementById('modalTitle').innerText = title;
      document.getElementById('modalDesc').innerText = desc;
      pendingAction = onConfirm;
      document.getElementById('confirmModal').style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('confirmModal').style.display = 'none';
      pendingAction = null;
    }

    document.getElementById('modalConfirmBtn').addEventListener('click', () => {
      if (pendingAction) pendingAction();
      closeModal();
    });

    function confirmDeleteConv(convId, title) {
      openModal(
        '🗑️',
        'Delete Conversation?',
        'Are you sure you want to permanently delete conversation "' + title + '" (' + convId.substring(0, 8) + ')?',
        () => vscode.postMessage({ command: 'deleteConversation', convId })
      );
    }

    function confirmBatchDelete() {
      const checked = document.querySelectorAll('.conv-checkbox:checked');
      const convIds = Array.from(checked).map(cb => cb.getAttribute('data-id'));
      if (convIds.length === 0) return;

      openModal(
        '🗑️',
        'Delete Selected Conversations?',
        'Are you sure you want to permanently delete ' + convIds.length + ' selected conversations and all associated files?',
        () => vscode.postMessage({ command: 'deleteBatchConversations', convIds })
      );
    }

    function confirmDeleteFile(relativePath) {
      openModal(
        '📄',
        'Delete File?',
        'Are you sure you want to delete "' + relativePath + '"?',
        () => vscode.postMessage({ command: 'deleteFile', relativePath })
      );
    }

    function confirmDeleteAll() {
      openModal(
        '⚠️',
        'Delete All Local Files?',
        'DANGER: This will wipe all local conversation files in brain/. A safety backup snapshot will be created before deletion.',
        () => vscode.postMessage({ command: 'deleteAll' })
      );
    }
  </script>

</body>
</html>`;
        panel.webview.html = html;
    }
}
exports.DashboardWebview = DashboardWebview;
//# sourceMappingURL=dashboardWebview.js.map