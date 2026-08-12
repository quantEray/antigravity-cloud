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
exports.GitHubStorage = void 0;
const https = __importStar(require("https"));
const crypto_1 = require("../crypto");
class GitHubStorage {
    token;
    constructor(token) {
        this.token = token;
    }
    async uploadSyncPayload(encryptedPayload, gistId) {
        // Automatically split payload into 3 MB safe Gist chunks
        const files = (0, crypto_1.chunkEncryptedPayload)(encryptedPayload, 3 * 1024 * 1024);
        const payloadObj = {
            description: 'Antigravity Anywhere Multi-Part Encrypted Sync Backup',
            public: false,
            files,
        };
        const data = JSON.stringify(payloadObj);
        if (gistId) {
            // Update existing Gist
            await this.request('PATCH', `/gists/${gistId}`, data);
            return gistId;
        }
        else {
            // Create new Gist
            const res = await this.request('POST', '/gists', data);
            return res.id;
        }
    }
    async findExistingGistId() {
        try {
            const gists = await this.request('GET', '/gists');
            if (Array.isArray(gists)) {
                for (const gist of gists) {
                    if (gist.files && (gist.files['antigravity_manifest.json'] || gist.files['antigravity_cloud_backup.json'])) {
                        return gist.id;
                    }
                }
            }
        }
        catch {
            // Fall through if list gists fails
        }
        return null;
    }
    async downloadSyncPayload(gistId) {
        const res = await this.request('GET', `/gists/${gistId}`);
        const chunksMap = {};
        for (const [fileName, fileObj] of Object.entries(res.files)) {
            if (fileObj.truncated && fileObj.raw_url) {
                chunksMap[fileName] = await this.requestRawUrl(fileObj.raw_url);
            }
            else {
                chunksMap[fileName] = fileObj.content;
            }
        }
        return (0, crypto_1.reassembleChunkedPayload)(chunksMap);
    }
    requestRawUrl(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Antigravity-Anywhere-Extension',
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => resolve(data));
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Raw URL fetch timed out.'));
            });
            req.on('error', (err) => reject(err));
            req.end();
        });
    }
    request(method, path, body) {
        const cleanToken = this.token.trim().replace(/^["']|["']$/g, '');
        const authHeader = cleanToken.startsWith('Bearer ') || cleanToken.startsWith('token ')
            ? cleanToken
            : (cleanToken.startsWith('github_pat_') ? `Bearer ${cleanToken}` : `token ${cleanToken}`);
        const bodyBuffer = body ? Buffer.from(body, 'utf-8') : undefined;
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path,
                method,
                timeout: 90000, // 90s network timeout
                headers: {
                    'User-Agent': 'Antigravity-Anywhere-Extension',
                    Authorization: authHeader,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    ...(bodyBuffer ? { 'Content-Length': bodyBuffer.length } : {}),
                },
            };
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => (responseData += chunk));
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(responseData));
                        }
                        catch {
                            resolve(responseData);
                        }
                    }
                    else {
                        let errorMsg = `GitHub API Error ${res.statusCode}: ${responseData.substring(0, 300)}`;
                        if (res.statusCode === 401) {
                            errorMsg = `GitHub API 401 Unauthorized. Token="${cleanToken.substring(0, 12)}..."`;
                        }
                        else if (res.statusCode === 404) {
                            errorMsg = 'GitHub API 404: Gist ID does not exist or token lacks permission.';
                        }
                        else if (res.statusCode === 413 || res.statusCode === 422) {
                            errorMsg = `GitHub API ${res.statusCode}: Payload exceeds Gist limits.`;
                        }
                        reject(new Error(errorMsg));
                    }
                });
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('GitHub API Connection Timed Out (90s).'));
            });
            req.on('error', (err) => reject(err));
            if (bodyBuffer) {
                req.write(bodyBuffer);
            }
            req.end();
        });
    }
}
exports.GitHubStorage = GitHubStorage;
//# sourceMappingURL=githubStorage.js.map