import * as http from 'http';
import * as https from 'https';
import { getConfig } from '../config';
import { GoogleAuthManager } from '../googleAuth';

export class GoogleDriveStorage {
  private token: string;
  private abortSignal?: AbortSignal;

  constructor(token: string, abortSignal?: AbortSignal) {
    this.token = token.trim();
    this.abortSignal = abortSignal;
  }

  public async uploadSyncPayload(
    encryptedPayload: string,
    fileId?: string,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<string> {
    const fileName = 'antigravity_cloud_backup.enc';
    const bodyBuffer = Buffer.from(encryptedPayload, 'utf-8');

    let validFileId = fileId;
    if (!validFileId) {
      validFileId = (await this.findBackupFileId()) || undefined;
    }

    // A) Update existing backup file via PATCH on media endpoint
    if (validFileId) {
      try {
        await this.request(
          'PATCH',
          `/upload/drive/v3/files/${validFileId}?uploadType=media`,
          bodyBuffer,
          'application/octet-stream',
          true,
          false,
          false,
          onProgress
        );
        return validFileId;
      } catch (err: any) {
        if (this.abortSignal?.aborted) throw new Error('Operation canceled by user.');
        // If PATCH on validFileId fails (e.g. 404 deleted), search for active file in Drive
        const reFoundId = await this.findBackupFileId();
        if (reFoundId && reFoundId !== validFileId) {
          try {
            await this.request(
              'PATCH',
              `/upload/drive/v3/files/${reFoundId}?uploadType=media`,
              bodyBuffer,
              'application/octet-stream',
              true,
              false,
              false,
              onProgress
            );
            return reFoundId;
          } catch {}
        }
      }
    }

    // B) Create a NEW file using Resumable Upload on www.googleapis.com (bypasses 5MB multipart metadata limit!)
    // 1. Initiate resumable upload session on www.googleapis.com
    const initRes = await this.requestFullResponse(
      'POST',
      '/upload/drive/v3/files?uploadType=resumable',
      Buffer.from(JSON.stringify({ name: fileName, mimeType: 'application/octet-stream' }), 'utf-8'),
      'application/json; charset=UTF-8',
      false // www.googleapis.com
    );

    const locationHeader = initRes.headers['location'];
    if (!locationHeader) {
      throw new Error('Google Drive Resumable Upload initialization failed: Location header missing.');
    }

    // 2. Upload actual binary payload buffer to the location URL via PUT
    const locationUrl = new URL(locationHeader);
    const uploadedRes = await this.requestUrl<any>(
      'PUT',
      locationUrl.hostname,
      locationUrl.pathname + locationUrl.search,
      bodyBuffer,
      'application/octet-stream',
      onProgress
    );

    return uploadedRes.id;
  }

  public async downloadSyncPayload(fileId?: string): Promise<string> {
    if (fileId) {
      try {
        return await this.request<string>(
          'GET',
          `/drive/v3/files/${fileId}?alt=media`,
          undefined,
          undefined,
          false,
          true
        );
      } catch (err: any) {
        // Fall back to searching for active backup file if specific fileId fails
      }
    }

    const foundId = await this.findBackupFileId();
    if (!foundId) {
      throw new Error('No backup file (antigravity_cloud_backup.enc) found in your Google Drive account. Please perform a Sync first.');
    }

    return await this.request<string>(
      'GET',
      `/drive/v3/files/${foundId}?alt=media`,
      undefined,
      undefined,
      false,
      true
    );
  }

  public static async cleanupDuplicates(storage: GoogleDriveStorage): Promise<void> {
    try {
      await storage.findBackupFileId();
    } catch {}
  }

  public async findBackupFileId(): Promise<string | null> {
    const query = encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false");
    const res = await this.request<{ files: Array<{ id: string; modifiedTime?: string }> }>(
      'GET',
      `/drive/v3/files?q=${query}&fields=files(id,modifiedTime)`
    );

    if (res.files && res.files.length > 0) {
      if (res.files.length > 1) {
        // Automatically clean up duplicate legacy backup files, keeping the newest one
        const sorted = [...res.files].sort((a, b) => {
          const tA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
          const tB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
          return tB - tA;
        });

        const activeFileId = sorted[0].id;
        for (let i = 1; i < sorted.length; i++) {
          try {
            await this.request('DELETE', `/drive/v3/files/${sorted[i].id}`);
          } catch {}
        }
        return activeFileId;
      }
      return res.files[0].id;
    }
    return null;
  }

  public async getBackupFileDetails(): Promise<{ id: string; name: string; size: string; modifiedTime: string } | null> {
    try {
      const query = encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false");
      const res = await this.request<{ files: Array<{ id: string; name: string; size?: string; modifiedTime?: string }> }>(
        'GET',
        `/drive/v3/files?q=${query}&fields=files(id,name,size,modifiedTime)`
      );

      if (res.files && res.files.length > 0) {
        const item = res.files[0];
        return {
          id: item.id,
          name: item.name || 'antigravity_cloud_backup.enc',
          size: item.size || '0',
          modifiedTime: item.modifiedTime || new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  public async findExistingFileId(): Promise<string | null> {
    return this.findBackupFileId();
  }

  private async requestUrl<T>(
    method: string,
    hostname: string,
    path: string,
    bodyBuffer?: Buffer,
    contentType?: string,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<T> {
    const config = getConfig();
    const activeToken = this.token || config.googleDriveToken;
    const cleanToken = activeToken.replace(/^["']|["']$/g, '').trim();
    const authHeader = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
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
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 350) {
            try {
              resolve(JSON.parse(responseData));
            } catch {
              resolve(responseData as any);
            }
          } else {
            reject(new Error(`Google Drive Resumable Upload Error (${res.statusCode}): ${responseData.substring(0, 500)}`));
          }
        });
      });

      if (this.abortSignal) {
        if (this.abortSignal.aborted) {
          req.destroy();
          return reject(new Error('Operation canceled by user.'));
        }
        this.abortSignal.addEventListener('abort', () => {
          req.destroy();
          reject(new Error('Operation canceled by user.'));
        });
      }

      req.on('error', (err) => reject(err));

      if (bodyBuffer) {
        if (onProgress) {
          const CHUNK_SIZE = 2 * 1024 * 1024;
          let offset = 0;
          const total = bodyBuffer.length;

          const writeNext = () => {
            if (this.abortSignal?.aborted) return;
            while (offset < total) {
              const chunk = bodyBuffer.subarray(offset, Math.min(offset + CHUNK_SIZE, total));
              offset += chunk.length;
              onProgress(offset, total);

              const canContinue = req.write(chunk);
              if (!canContinue) {
                req.once('drain', writeNext);
                return;
              }
            }
            req.end();
          };
          writeNext();
        } else {
          req.write(bodyBuffer);
          req.end();
        }
      } else {
        req.end();
      }
    });
  }

  private async requestFullResponse(
    method: string,
    path: string,
    bodyBuffer?: Buffer,
    contentType?: string,
    isUploadDomain: boolean = false
  ): Promise<{ headers: http.IncomingHttpHeaders; statusCode?: number; body: string }> {
    const config = getConfig();
    const activeToken = this.token || config.googleDriveToken;
    const cleanToken = activeToken.replace(/^["']|["']$/g, '').trim();
    const authHeader = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;
    const hostname = isUploadDomain ? 'upload.googleapis.com' : 'www.googleapis.com';

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
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
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 350) {
            resolve({ headers: res.headers, statusCode: res.statusCode, body: responseData });
          } else {
            reject(new Error(`Google Drive Resumable Init Error (${res.statusCode}): ${responseData.substring(0, 500)}`));
          }
        });
      });

      if (this.abortSignal) {
        if (this.abortSignal.aborted) {
          req.destroy();
          return reject(new Error('Operation canceled by user.'));
        }
        this.abortSignal.addEventListener('abort', () => {
          req.destroy();
          reject(new Error('Operation canceled by user.'));
        });
      }

      req.on('error', (err) => reject(err));
      if (bodyBuffer) req.write(bodyBuffer);
      req.end();
    });
  }

  private async request<T>(
    method: string,
    path: string,
    bodyBuffer?: Buffer,
    contentType?: string,
    isUploadDomain: boolean = false,
    returnRawText: boolean = false,
    hasRetriedAuth: boolean = false,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<T> {
    const config = getConfig();
    const activeToken = this.token || config.googleDriveToken;
    const cleanToken = activeToken.replace(/^["']|["']$/g, '').trim();
    const authHeader = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;

    const hostname = isUploadDomain ? 'upload.googleapis.com' : 'www.googleapis.com';

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
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
              resolve(responseData as any);
            } else {
              try {
                resolve(JSON.parse(responseData));
              } catch {
                resolve(responseData as any);
              }
            }
          } else if (res.statusCode === 401 && !hasRetriedAuth && config.googleRefreshToken) {
            // Automatically refresh access token in background if 401 encountered!
            try {
              const newToken = await GoogleAuthManager.refreshAccessToken(config.googleRefreshToken);
              this.token = newToken;
              const retryRes = await this.request<T>(method, path, bodyBuffer, contentType, isUploadDomain, returnRawText, true, onProgress);
              resolve(retryRes);
            } catch (refreshErr: any) {
              reject(new Error('Google Access Token expired and background refresh failed: ' + refreshErr.message));
            }
          } else {
            let errorMsg = `Google Drive API Error (${res.statusCode}): ${responseData.substring(0, 500)}`;
            if (res.statusCode === 401) {
              errorMsg = `Google Drive API 401 Unauthorized: Access token expired. Please click "🔑 Sign in with Google" to re-authorize.`;
            } else if (res.statusCode === 404) {
              errorMsg = `Google Drive API 404 Not Found. Google response: ${responseData.substring(0, 300)}`;
            }
            reject(new Error(errorMsg));
          }
        });
      });

      let hasHandledResponse = false;

      if (this.abortSignal) {
        if (this.abortSignal.aborted) {
          req.destroy();
          hasHandledResponse = true;
          return reject(new Error('Operation canceled by user.'));
        }
        this.abortSignal.addEventListener('abort', () => {
          req.destroy();
          if (!hasHandledResponse) {
            hasHandledResponse = true;
            reject(new Error('Operation canceled by user.'));
          }
        });
      }

      req.on('timeout', () => {
        req.destroy();
        if (!hasHandledResponse) {
          hasHandledResponse = true;
          reject(new Error('Google Drive API Connection Timed Out (180s). Check network connection.'));
        }
      });

      req.on('error', (err: any) => {
        if (!hasHandledResponse) {
          if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
            setTimeout(() => {
              if (!hasHandledResponse) {
                hasHandledResponse = true;
                reject(err);
              }
            }, 500);
          } else {
            hasHandledResponse = true;
            reject(err);
          }
        }
      });

      if (bodyBuffer) {
        if (onProgress) {
          const CHUNK_SIZE = 2 * 1024 * 1024;
          let offset = 0;
          const total = bodyBuffer.length;

          const writeNext = () => {
            if (this.abortSignal?.aborted) return;
            while (offset < total) {
              const chunk = bodyBuffer.subarray(offset, Math.min(offset + CHUNK_SIZE, total));
              offset += chunk.length;
              onProgress(offset, total);

              const canContinue = req.write(chunk);
              if (!canContinue) {
                req.once('drain', writeNext);
                return;
              }
            }
            req.end();
          };
          writeNext();
        } else {
          req.write(bodyBuffer);
          req.end();
        }
      } else {
        req.end();
      }
    });
  }
}
