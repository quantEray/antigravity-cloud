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
exports.GoogleDriveStorage = void 0;
const https = __importStar(require("https"));
const config_1 = require("../config");
const googleAuth_1 = require("../googleAuth");
class GoogleDriveStorage {
    token;
    constructor(token) {
        this.token = token.trim();
    }
    async uploadSyncPayload(encryptedPayload, fileId) {
        const fileName = 'antigravity_cloud_backup.enc';
        const bodyBuffer = Buffer.from(encryptedPayload, 'utf-8');
        if (fileId) {
            try {
                await this.request('PATCH', `/upload/drive/v3/files/${fileId}?uploadType=media`, bodyBuffer, 'application/octet-stream', true);
                return fileId;
            }
            catch (err) {
                if (err.message && err.message.includes('404')) {
                    // Fall through to create new file if 404
                }
                else {
                    throw err;
                }
            }
        }
        const boundary = '---------------AntigravityBoundary' + Date.now();
        const metadata = JSON.stringify({
            name: fileName,
            description: 'Antigravity Anywhere Full Encrypted Backup',
            mimeType: 'application/octet-stream',
        });
        let multipartBody = `--${boundary}\r\n`;
        multipartBody += `Content-Type: application/json; charset=UTF-8\r\n\r\n`;
        multipartBody += `${metadata}\r\n`;
        multipartBody += `--${boundary}\r\n`;
        multipartBody += `Content-Type: application/octet-stream\r\n\r\n`;
        const headerBuf = Buffer.from(multipartBody, 'utf-8');
        const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
        const totalBuffer = Buffer.concat([headerBuf, bodyBuffer, footerBuf]);
        const res = await this.request('POST', `/upload/drive/v3/files?uploadType=multipart`, totalBuffer, `multipart/related; boundary=${boundary}`, true);
        return res.id;
    }
    async downloadSyncPayload(fileId) {
        return await this.request('GET', `/drive/v3/files/${fileId}?alt=media`, undefined, undefined, false, true);
    }
    async findBackupFileId() {
        const query = encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false");
        const res = await this.request('GET', `/drive/v3/files?q=${query}&fields=files(id)`);
        if (res.files && res.files.length > 0) {
            return res.files[0].id;
        }
        return null;
    }
    async findExistingFileId() {
        return this.findBackupFileId();
    }
    async request(method, path, bodyBuffer, contentType, isUploadDomain = false, returnRawText = false, hasRetriedAuth = false) {
        const config = (0, config_1.getConfig)();
        const activeToken = this.token || config.googleDriveToken;
        const cleanToken = activeToken.replace(/^["']|["']$/g, '').trim();
        const authHeader = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;
        const hostname = 'www.googleapis.com';
        return new Promise((resolve, reject) => {
            const options = {
                hostname,
                path,
                method,
                timeout: 180000,
                headers: {
                    'User-Agent': 'Antigravity-Anywhere-Extension',
                    Authorization: authHeader,
                    ...(contentType ? { 'Content-Type': contentType } : {}),
                    ...(bodyBuffer ? { 'Content-Length': bodyBuffer.length } : {}),
                },
            };
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => (responseData += chunk));
                res.on('end', async () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        if (returnRawText) {
                            resolve(responseData);
                        }
                        else {
                            try {
                                resolve(JSON.parse(responseData));
                            }
                            catch {
                                resolve(responseData);
                            }
                        }
                    }
                    else if (res.statusCode === 401 && !hasRetriedAuth && config.googleRefreshToken) {
                        // Automatically refresh access token in background if 401 encountered!
                        try {
                            const newToken = await googleAuth_1.GoogleAuthManager.refreshAccessToken(config.googleRefreshToken);
                            this.token = newToken;
                            const retryRes = await this.request(method, path, bodyBuffer, contentType, isUploadDomain, returnRawText, true);
                            resolve(retryRes);
                        }
                        catch (refreshErr) {
                            reject(new Error('Google Access Token expired and background refresh failed: ' + refreshErr.message));
                        }
                    }
                    else {
                        let errorMsg = `Google Drive API Error (${res.statusCode}): ${responseData.substring(0, 300)}`;
                        if (res.statusCode === 401) {
                            errorMsg = `Google Drive API 401 Unauthorized: Access token expired. Please click "🔑 Sign in with Google" to re-authorize.`;
                        }
                        else if (res.statusCode === 403) {
                            errorMsg = `Google Drive API 403 Forbidden: Token lacks Drive scope (https://www.googleapis.com/auth/drive.file).`;
                        }
                        else if (res.statusCode === 404) {
                            errorMsg = `Google Drive API 404 Not Found: Backup file ID does not exist in your Google Drive.`;
                        }
                        reject(new Error(errorMsg));
                    }
                });
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Google Drive API Connection Timed Out (180s). Check network connection.'));
            });
            req.on('error', (err) => reject(err));
            if (bodyBuffer) {
                const CHUNK_SIZE = 512 * 1024;
                for (let offset = 0; offset < bodyBuffer.length; offset += CHUNK_SIZE) {
                    const chunk = bodyBuffer.subarray(offset, offset + CHUNK_SIZE);
                    req.write(chunk);
                }
            }
            req.end();
        });
    }
}
exports.GoogleDriveStorage = GoogleDriveStorage;
//# sourceMappingURL=googleDriveStorage.js.map