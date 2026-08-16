# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension will be documented in this file.

## [0.2.2] - 2026-08-16

### Fixed
- 🔑 **Interactive Encryption Password Prompt:** Fixed issue where restoring an encrypted backup on a secondary device without a saved password failed without prompting. Added automatic interactive password input box prompt during restore, automatic password validation, and auto-saving of valid passphrases.
- ⚙️ **Set Encryption Password Command:** Added `Antigravity Cloud: Set Encryption Password` command and dashboard option to set, change, or clear custom encryption passwords.

## [0.2.1] - 2026-08-13

### Added
- ⚡ **Built-In GitHub Release Auto-Updater:** Automatic background check for new extension releases with 1-click update installation.

## [0.2.0] - 2026-08-13

### Added
- 🌟 **GitHub Star & Community Feedback Widget:** Embedded interactive "⭐ Star Project" and "💬 Feedback" buttons.
- 🔄 **Multi-Directory Restore Mirroring:** Automated cross-device restore synchronization across both `~/.gemini/antigravity-ide` and `~/.gemini/antigravity` paths.
- 🧹 **Automatic Duplicate File Cleanup:** Intelligently detects and cleans up duplicate legacy backup files on Google Drive.
