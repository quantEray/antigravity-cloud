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
exports.GoogleAuthManager = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const crypto = __importStar(require("crypto"));
const vscode = __importStar(require("vscode"));
const config_1 = require("./config");
const CLIENT_ID = '627024998523-13an3bmndm293rvgu9faomi6ao9bepks.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
].join(' ');
const AUTH_TIMEOUT_MS = 120_000; // 2 minutes
class GoogleAuthManager {
    /**
     * Full 1-click OAuth2 PKCE flow via localhost callback.
     * User only clicks "Allow" in the browser — no manual token copy needed.
     */
    static async startLoginFlow() {
        const port = await findFreePort();
        const redirectUri = `http://127.0.0.1:${port}`;
        // PKCE: code_verifier → code_challenge
        const codeVerifier = base64url(crypto.randomBytes(32));
        const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(CLIENT_ID)}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(SCOPES)}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `code_challenge=${codeChallenge}&` +
            `code_challenge_method=S256`;
        // Start local callback server BEFORE opening browser
        const codePromise = startCallbackServer(port);
        await vscode.env.openExternal(vscode.Uri.parse(authUrl));
        vscode.window.showInformationMessage('🔑 Google sign-in page opened — authorize in browser to complete login.', { modal: false });
        let code;
        try {
            code = await withTimeout(codePromise, AUTH_TIMEOUT_MS);
        }
        catch (e) {
            throw new Error('Google Sign-In timed out or was cancelled. Please try again.');
        }
        const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
        await (0, config_1.setGoogleTokens)(tokens.accessToken, tokens.refreshToken);
        // Fetch and store user profile info
        try {
            await this.fetchAndStoreUserProfile(tokens.accessToken);
        }
        catch {
            // Ignore userinfo failure, tokens are still valid
        }
        return tokens;
    }
    /** Fetch Google user profile (email, name, picture) using access token and store it. */
    static fetchAndStoreUserProfile(accessToken) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'www.googleapis.com',
                path: '/oauth2/v3/userinfo',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'Antigravity-Cloud-IDE',
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', async () => {
                    try {
                        if (res.statusCode === 200) {
                            const parsed = JSON.parse(data);
                            const profile = {
                                email: parsed.email || '',
                                name: parsed.name || parsed.email || 'Google User',
                                picture: parsed.picture || '',
                            };
                            await (0, config_1.setGoogleUserProfile)(profile.email, profile.name, profile.picture);
                            resolve(profile);
                        }
                        else {
                            reject(new Error(`Userinfo API error (${res.statusCode}): ${data}`));
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            });
            req.on('error', (err) => reject(err));
            req.end();
        });
    }
    /** Refresh an expired access token using a stored refresh token. */
    static refreshAccessToken(refreshToken) {
        return new Promise((resolve, reject) => {
            if (!refreshToken) {
                return reject(new Error('No Refresh Token available. Please sign in with Google again.'));
            }
            const postData = new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: refreshToken,
            }).toString();
            const options = {
                hostname: 'oauth2.googleapis.com',
                path: '/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', async () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.access_token) {
                            await (0, config_1.setGoogleTokens)(parsed.access_token);
                            // Fetch user profile if missing
                            this.fetchAndStoreUserProfile(parsed.access_token).catch(() => { });
                            resolve(parsed.access_token);
                        }
                        else {
                            reject(new Error('Failed to refresh Google Access Token: ' +
                                (parsed.error_description || JSON.stringify(parsed))));
                        }
                    }
                    catch (e) {
                        reject(new Error('Failed to parse refresh response: ' + e.message));
                    }
                });
            });
            req.on('error', (err) => reject(err));
            req.write(postData);
            req.end();
        });
    }
    /** Sign out by clearing all saved Google credentials. */
    static async logout() {
        await (0, config_1.clearGoogleAuth)();
    }
    /** Validate current token or refresh if needed. Returns true if active session exists. */
    static async validateOrRefreshToken() {
        const config = (0, config_1.getConfig)();
        if (!config.googleDriveToken)
            return false;
        try {
            await this.fetchAndStoreUserProfile(config.googleDriveToken);
            return true;
        }
        catch {
            // If token expired, try refresh
            if (config.googleRefreshToken) {
                try {
                    const newToken = await this.refreshAccessToken(config.googleRefreshToken);
                    await this.fetchAndStoreUserProfile(newToken);
                    return true;
                }
                catch {
                    await this.logout();
                    return false;
                }
            }
            await this.logout();
            return false;
        }
    }
}
exports.GoogleAuthManager = GoogleAuthManager;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function exchangeCodeForTokens(code, codeVerifier, redirectUri) {
    return new Promise((resolve, reject) => {
        const postData = new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
        }).toString();
        const options = {
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.access_token) {
                        resolve({
                            accessToken: parsed.access_token,
                            refreshToken: parsed.refresh_token,
                        });
                    }
                    else {
                        reject(new Error('OAuth Token Exchange Error: ' +
                            (parsed.error_description || JSON.stringify(parsed))));
                    }
                }
                catch (e) {
                    reject(new Error('Failed to parse token response: ' + e.message));
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
    });
}
function startCallbackServer(port) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            try {
                const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
                const code = url.searchParams.get('code');
                const error = url.searchParams.get('error');
                if (error) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(callbackHtml('❌ Sign-In Cancelled', 'You can close this tab and return to Antigravity IDE.', false));
                    server.close();
                    reject(new Error('Google Sign-In was denied: ' + error));
                    return;
                }
                if (code) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(callbackHtml('✅ Signed In!', 'You can close this tab and return to Antigravity IDE.', true));
                    server.close();
                    resolve(code);
                }
            }
            catch (e) {
                reject(e);
                server.close();
            }
        });
        server.on('error', reject);
        server.listen(port, '127.0.0.1');
    });
}
function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            const port = addr.port;
            server.close(() => resolve(port));
        });
        server.on('error', reject);
    });
}
function base64url(buf) {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), ms);
        promise.then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
    });
}
function callbackHtml(title, message, success) {
    const color = success ? '#4ade80' : '#f87171';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Antigravity Cloud — ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f13;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #1a1a2e;
      border: 1px solid #2d2d44;
      border-radius: 16px;
      padding: 48px 56px;
      text-align: center;
      max-width: 420px;
    }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 10px; }
    p  { font-size: 14px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '🚀' : '🔒'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=googleAuth.js.map