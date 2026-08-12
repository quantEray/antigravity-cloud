"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcher = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileWatcher {
    watcher = null;
    debounceTimer = null;
    onTriggerSync;
    debounceMs;
    constructor(debounceSeconds, onTriggerSync) {
        this.debounceMs = debounceSeconds * 1000;
        this.onTriggerSync = onTriggerSync;
    }
    startWatching(antigravityDataDir) {
        const brainDir = path.join(antigravityDataDir, 'brain');
        if (!fs.existsSync(brainDir)) {
            try {
                fs.mkdirSync(brainDir, { recursive: true });
            }
            catch {
                return;
            }
        }
        try {
            this.watcher = fs.watch(brainDir, { recursive: true }, (eventType, filename) => {
                if (filename && filename.endsWith('.log'))
                    return;
                this.handleChange();
            });
        }
        catch {
            // Fallback if recursive watch not supported on some platform versions
        }
    }
    handleChange() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.onTriggerSync();
        }, this.debounceMs);
    }
    stopWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=watcher.js.map