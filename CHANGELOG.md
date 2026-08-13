# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension will be documented in this file.

## [0.2.0] - 2026-08-13

### Added
- 🌟 **GitHub Star & Community Feedback Widget:** Embedded interactive "⭐ Star Project" and "💬 Feedback" buttons into the Webview Dashboard and Sidebar.
- 🔄 **Multi-Directory Restore Mirroring:** Automated cross-device restore synchronization mirroring data across both `~/.gemini/antigravity-ide` and `~/.gemini/antigravity` paths.
- 🧹 **Automatic Duplicate File Cleanup:** Intelligently detects and cleans up duplicate legacy backup files on Google Drive to maintain a single, clean backup state.
- 🖼️ **Marketplace Branding:** High-resolution 240px AI logo embedded directly into extension manifest for VS Code and Open VSX marketplaces.

### Fixed
- Fixed 100% conversation sync status badge persistence after restoring from cloud payloads.
- Fixed resumable chunk streaming for payloads exceeding 200MB.

## [0.1.0] - 2026-08-12

- Initial release of Antigravity Anywhere & Cloud Sync Hub with E2E PBKDF2 + AES-256-GCM encryption, OAuth 2.0 PKCE authentication, and interactive Webview Dashboard.
