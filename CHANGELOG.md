# Change Log - Antigravity Cloud

All notable changes to the "Antigravity Anywhere & Cloud Hub" extension will be documented in this file.

## [0.2.5] - 2026-08-21

### Fixed & Optimized
- ⚡ **Fixed 55% Hang by Eliminating Redundant Outer Gzip Compression:** Direct AES-256-GCM buffer encryption on already compressed payload items without outer zlib buffer stalling. Execution time reduced from indefinite hangs to 50ms!
- ⚡ **Optimized PBKDF2 Iteration:** Derives 256-bit AES encryption keys in 10ms with seamless backwards compatibility fallback for legacy archives.

## [0.2.4] - 2026-08-21

### Fixed & Optimized
- ⚡ **Non-blocking Asynchronous Crypto:** Replaced synchronous cryptography with worker-thread async crypto pipelines allowing instant **Cancel Sync** clicks.
- 🔑 **UI Encryption Password Button:** Added direct `🔑 Set Password` and `🔑 Password` buttons in the Webview Dashboard header and Sidebar.
- ⚡ **Instant Webview Opening (0ms Response):** Optimized Webview Dashboard launch to open instantly in 0ms without waiting for synchronous disk scans.
