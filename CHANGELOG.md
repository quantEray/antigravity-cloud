# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension will be documented in this file.

## [0.2.3] - 2026-08-21

### Fixed
- ⚡ **Fixed V8 String Memory Limit Crash (`RangeError: Invalid string length`):** Implemented in-memory per-file Deflate stream compression during scanning. Reduces payload JSON memory footprint by 15x (~550 MB uncompressed data -> ~25 MB payload), preventing V8 string length crashes when syncing large chat histories and binary databases across devices.

## [0.2.2] - 2026-08-16

### Fixed
- 🔑 **Interactive Encryption Password Prompt:** Fixed issue where restoring an encrypted backup on a secondary device without a saved password failed without prompting. Added automatic interactive password input box prompt during restore.

## [0.2.1] - 2026-08-13

### Added
- ⚡ **Built-In GitHub Release Auto-Updater:** Automatic background check for new extension releases with 1-click update installation.
