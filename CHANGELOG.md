# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension are documented here.

## [0.3.0] - 2026-08-21

### 🚀 Critical Fixes: Infinite Chat Loading Spinner & Message Restoration
- **SQLite WAL & SHM Cleanup on Restore:** Fixed a critical bug where restoring conversations on a secondary machine left stale `.db-shm` and `.db-wal` locks, preventing SQLite from opening the conversation messages. Stale SHM files are now cleanly purged during restore.
- **Deep JSON/Text Path Denormalization:** Fixed path normalizer to globally denormalize embedded workspace paths inside `gz64:` compressed message envelopes, `transcript.jsonl`, and artifacts so chats open instantly across different machines and operating systems (Mac <-> Windows <-> Linux).
- **Safety Database Isolation:** Removed corruptive overwrites of VS Code system-level `state.vscdb` and LevelDB databases during restore.

## [0.2.1] - 2026-08-13

- Added built-in GitHub Release Auto-Updater engine for seamless 1-click updates.
- Added interactive "⭐ Star Project" and "💬 Feedback" community widgets.
- Enhanced multi-directory restore mirroring across `~/.gemini/antigravity` and `~/.gemini/antigravity-ide`.

## [0.1.0] - 2026-08-12

- Initial release of Antigravity Anywhere & Cloud Sync Hub with E2E PBKDF2 + AES-256-GCM encryption, Google OAuth 2.0 PKCE, and interactive Webview Dashboard.
