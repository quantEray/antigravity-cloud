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
exports.PathNormalizer = void 0;
const os = __importStar(require("os"));
class PathNormalizer {
    static userHome = os.homedir();
    /**
     * Replaces absolute local paths with universal place-holders.
     * e.g. /Users/eray/Desktop/Project -> ${USER_HOME}/Desktop/Project
     * e.g. C:\Users\John\Desktop\Project -> ${USER_HOME}/Desktop/Project
     */
    static normalize(inputPath) {
        if (!inputPath)
            return inputPath;
        // Convert Windows backslashes to forward slashes for cross-OS standard
        let normalized = inputPath.replace(/\\/g, '/');
        const normalizedHome = this.userHome.replace(/\\/g, '/');
        if (normalized.startsWith(normalizedHome)) {
            normalized = normalized.replace(normalizedHome, '${USER_HOME}');
        }
        return normalized;
    }
    /**
     * Denormalizes universal placeholders back into current local OS absolute paths.
     * e.g. ${USER_HOME}/Desktop/Project -> /Users/eray/Desktop/Project (on Mac)
     */
    static denormalize(inputPath) {
        if (!inputPath)
            return inputPath;
        // Use forward slashes for user home to ensure JSON strings remain valid on all OSes
        const normalizedHome = this.userHome.replace(/\\/g, '/');
        return inputPath.replace(/\${USER_HOME}/g, normalizedHome);
    }
}
exports.PathNormalizer = PathNormalizer;
//# sourceMappingURL=pathNormalizer.js.map