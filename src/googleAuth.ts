import * as http from 'http';
import * as https from 'https';
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { setGoogleTokens, setGoogleUserProfile, clearGoogleAuth, getConfig } from './config';

const CLIENT_ID = '627024998523-13an3bmndm293rvgu9faomi6ao9bepks.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

const AUTH_TIMEOUT_MS = 120_000; // 2 minutes

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export class GoogleAuthManager {
  /**
   * Full 1-click OAuth2 PKCE flow via localhost callback.
   * User only clicks "Allow" in the browser — no manual token copy needed.
   */
  public static async startLoginFlow(): Promise<TokenResponse> {
    const port = await findFreePort();
    const redirectUri = `http://127.0.0.1:${port}`;

    // PKCE: code_verifier → code_challenge
    const codeVerifier = base64url(crypto.randomBytes(32));
    const codeChallenge = base64url(
      crypto.createHash('sha256').update(codeVerifier).digest()
    );

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
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

    vscode.window.showInformationMessage(
      '🔑 Google sign-in page opened — authorize in browser to complete login.',
      { modal: false }
    );

    let code: string;
    try {
      code = await withTimeout(codePromise, AUTH_TIMEOUT_MS);
    } catch (e: any) {
      throw new Error('Google Sign-In timed out or was cancelled. Please try again.');
    }

    const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
    await setGoogleTokens(tokens.accessToken, tokens.refreshToken);

    // Fetch and store user profile info
    try {
      await this.fetchAndStoreUserProfile(tokens.accessToken);
    } catch {
      // Ignore userinfo failure, tokens are still valid
    }

    return tokens;
  }

  /** Fetch Google user profile (email, name, picture) using access token and store it. */
  public static fetchAndStoreUserProfile(accessToken: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
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
              const profile: UserProfile = {
                email: parsed.email || '',
                name: parsed.name || parsed.email || 'Google User',
                picture: parsed.picture || '',
              };
              await setGoogleUserProfile(profile.email, profile.name, profile.picture);
              resolve(profile);
            } else {
              reject(new Error(`Userinfo API error (${res.statusCode}): ${data}`));
            }
          } catch (err: any) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.end();
    });
  }

  /** Refresh an expired access token using a stored refresh token. */
  public static refreshAccessToken(refreshToken: string): Promise<string> {
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

      const options: https.RequestOptions = {
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
              await setGoogleTokens(parsed.access_token);
              // Fetch user profile if missing
              this.fetchAndStoreUserProfile(parsed.access_token).catch(() => {});
              resolve(parsed.access_token);
            } else {
              reject(
                new Error(
                  'Failed to refresh Google Access Token: ' +
                    (parsed.error_description || JSON.stringify(parsed))
                )
              );
            }
          } catch (e: any) {
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
  public static async logout(): Promise<void> {
    await clearGoogleAuth();
  }

  /** Validate current token or refresh if needed. Returns true if active session exists. */
  public static async validateOrRefreshToken(): Promise<boolean> {
    const config = getConfig();
    if (!config.googleDriveToken) return false;

    try {
      await this.fetchAndStoreUserProfile(config.googleDriveToken);
      return true;
    } catch {
      // If token expired, try refresh
      if (config.googleRefreshToken) {
        try {
          const newToken = await this.refreshAccessToken(config.googleRefreshToken);
          await this.fetchAndStoreUserProfile(newToken);
          return true;
        } catch {
          await this.logout();
          return false;
        }
      }
      await this.logout();
      return false;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenResponse> {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }).toString();

    const options: https.RequestOptions = {
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
          } else {
            reject(
              new Error(
                'OAuth Token Exchange Error: ' +
                  (parsed.error_description || JSON.stringify(parsed))
              )
            );
          }
        } catch (e: any) {
          reject(new Error('Failed to parse token response: ' + e.message));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

function startCallbackServer(port: number): Promise<string> {
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
      } catch (e) {
        reject(e);
        server.close();
      }
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1');
  });
}

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      const port = addr.port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

function callbackHtml(title: string, message: string, success: boolean): string {
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
