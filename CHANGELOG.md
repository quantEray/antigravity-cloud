# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension will be documented in this file.

## [0.3.2] - 2026-08-22

### Fixed
- 📦 **100% Full Backup Payload Integrity:** Fixed critical issue where incremental sync filtered out unchanged files, causing cloud backup files on Google Drive to contain only partial chats. Cloud backups now always preserve 100% of all conversation transcripts and SQLite databases across all devices.

## [0.3.1] - 2026-08-21

### Fixed
- 🐛 **SQLite WAL Stale Lock Cleanup:** Fixed issue where restored conversations did not show up in Antigravity chat history panel on target machines. `restoreBundle` now unlinks stale `.db-wal` and `.db-shm` locks prior to restoring SQLite `.db` databases.
- 🕒 **File Timestamp Touch:** Touches restored conversation files with current system timestamp (`mtime`) so Antigravity IDE file system watchers immediately detect database updates.
- 🔄 **Order Preservation:** Restores main `.db` database files before `.db-wal` write-ahead logs to prevent SQLite WAL mode page sequence mismatches.

## [0.2.0] - 2026-08-13

- Added GitHub Star & Community Feedback Widgets.
- Added Multi-Directory Restore Mirroring (`~/.gemini/antigravity-ide` and `~/.gemini/antigravity`).
- Added automatic duplicate backup file cleanup in Google Drive.
