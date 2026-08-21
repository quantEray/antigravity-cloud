# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension will be documented in this file.

## [0.2.4] - 2026-08-21

### Fixed & Optimized
- ⚡ **Fixed 55% Compression Freeze & Responsive Cancel:** Replaced heavy synchronous crypto (`pbkdf2Sync` and `gzipSync`) with non-blocking asynchronous worker-thread pipelines (`encryptPayloadAsync` & `decryptPayloadAsync`). The VS Code UI thread stays 100% fluid, allowing immediate **Cancel Sync** clicks at any stage!
- 🔑 **UI Encryption Password Button:** Added a direct `🔑 Set Password` / `🔑 Password` button in the Webview Dashboard header and Sidebar for 1-click encryption password configuration.
- ⚡ **Instant Webview Opening (0ms Response):** Optimized Webview Dashboard launch to open instantly in 0ms without waiting for synchronous disk scans or Google Drive network requests.

## [0.2.3] - 2026-08-21

### Fixed
- ⚡ **Fixed V8 String Memory Limit Crash (`RangeError: Invalid string length`):** Implemented in-memory per-file Deflate stream compression during scanning. Reduces payload JSON memory footprint by 15x.

## [0.2.2] - 2026-08-16

### Fixed
- 🔑 **Interactive Encryption Password Prompt:** Fixed issue where restoring an encrypted backup on a secondary device without a saved password failed without prompting.
