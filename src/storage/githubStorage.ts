import * as https from 'https';
import { chunkEncryptedPayload, reassembleChunkedPayload } from '../crypto';

export class GitHubStorage {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async uploadSyncPayload(encryptedPayload: string, gistId?: string): Promise<string> {
    // Automatically split payload into 3 MB safe Gist chunks
    const files = chunkEncryptedPayload(encryptedPayload, 3 * 1024 * 1024);

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
    } else {
      // Create new Gist
      const res = await this.request<{ id: string }>('POST', '/gists', data);
      return res.id;
    }
  }

  public async findExistingGistId(): Promise<string | null> {
    try {
      const gists = await this.request<Array<{ id: string; description?: string; files?: Record<string, any> }>>('GET', '/gists');
      if (Array.isArray(gists)) {
        for (const gist of gists) {
          if (gist.files && (gist.files['antigravity_manifest.json'] || gist.files['antigravity_cloud_backup.json'])) {
            return gist.id;
          }
        }
      }
    } catch {
      // Fall through if list gists fails
    }
    return null;
  }

  public async downloadSyncPayload(gistId: string): Promise<string> {
    const res = await this.request<{ files: Record<string, { content: string; truncated?: boolean; raw_url?: string }> }>('GET', `/gists/${gistId}`);

    const chunksMap: Record<string, string> = {};

    for (const [fileName, fileObj] of Object.entries(res.files)) {
      if (fileObj.truncated && fileObj.raw_url) {
        chunksMap[fileName] = await this.requestRawUrl(fileObj.raw_url);
      } else {
        chunksMap[fileName] = fileObj.content;
      }
    }

    return reassembleChunkedPayload(chunksMap);
  }

  private requestRawUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options: https.RequestOptions = {
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

  private request<T = any>(method: string, path: string, body?: string): Promise<T> {
    const cleanToken = this.token.trim().replace(/^["']|["']$/g, '');
    const authHeader = cleanToken.startsWith('Bearer ') || cleanToken.startsWith('token ')
      ? cleanToken
      : (cleanToken.startsWith('github_pat_') ? `Bearer ${cleanToken}` : `token ${cleanToken}`);

    const bodyBuffer = body ? Buffer.from(body, 'utf-8') : undefined;

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
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
            } catch {
              resolve(responseData as any);
            }
          } else {
            let errorMsg = `GitHub API Error ${res.statusCode}: ${responseData.substring(0, 300)}`;
            if (res.statusCode === 401) {
              errorMsg = `GitHub API 401 Unauthorized. Token="${cleanToken.substring(0, 12)}..."`;
            } else if (res.statusCode === 404) {
              errorMsg = 'GitHub API 404: Gist ID does not exist or token lacks permission.';
            } else if (res.statusCode === 413 || res.statusCode === 422) {
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
