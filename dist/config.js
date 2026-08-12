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
exports.getConfig = getConfig;
exports.setDriveFileId = setDriveFileId;
exports.setGoogleTokens = setGoogleTokens;
exports.setGoogleUserProfile = setGoogleUserProfile;
exports.clearGoogleAuth = clearGoogleAuth;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
function getConfig() {
    const config = vscode.workspace.getConfiguration('antigravityAnywhere');
    const homeDir = os.homedir();
    const antigravityDataDir = path.join(homeDir, '.gemini', 'antigravity-ide');
    const token = config.get('googleDriveToken', '').trim();
    const refreshToken = config.get('googleRefreshToken', '').trim();
    const fileId = config.get('driveFileId', '').trim();
    return {
        googleDriveToken: token,
        googleRefreshToken: refreshToken,
        driveFileId: fileId,
        googleUserEmail: config.get('googleUserEmail', '').trim(),
        googleUserName: config.get('googleUserName', '').trim(),
        googleUserPicture: config.get('googleUserPicture', '').trim(),
        encryptionPassword: config.get('encryptionPassword', ''),
        enableAutoSync: config.get('enableAutoSync', true),
        syncIntervalSeconds: config.get('syncIntervalSeconds', 10),
        antigravityDataDir,
    };
}
async function setDriveFileId(driveFileId) {
    const config = vscode.workspace.getConfiguration('antigravityAnywhere');
    await config.update('driveFileId', driveFileId, vscode.ConfigurationTarget.Global);
}
async function setGoogleTokens(accessToken, refreshToken) {
    const config = vscode.workspace.getConfiguration('antigravityAnywhere');
    await config.update('googleDriveToken', accessToken, vscode.ConfigurationTarget.Global);
    if (refreshToken) {
        await config.update('googleRefreshToken', refreshToken, vscode.ConfigurationTarget.Global);
    }
}
async function setGoogleUserProfile(email, name, picture) {
    const config = vscode.workspace.getConfiguration('antigravityAnywhere');
    await config.update('googleUserEmail', email, vscode.ConfigurationTarget.Global);
    await config.update('googleUserName', name, vscode.ConfigurationTarget.Global);
    await config.update('googleUserPicture', picture, vscode.ConfigurationTarget.Global);
}
async function clearGoogleAuth() {
    const config = vscode.workspace.getConfiguration('antigravityAnywhere');
    await config.update('googleDriveToken', '', vscode.ConfigurationTarget.Global);
    await config.update('googleRefreshToken', '', vscode.ConfigurationTarget.Global);
    await config.update('googleUserEmail', '', vscode.ConfigurationTarget.Global);
    await config.update('googleUserName', '', vscode.ConfigurationTarget.Global);
    await config.update('googleUserPicture', '', vscode.ConfigurationTarget.Global);
    await config.update('driveFileId', '', vscode.ConfigurationTarget.Global);
}
//# sourceMappingURL=config.js.map