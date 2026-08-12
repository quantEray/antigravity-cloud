import * as os from 'os';
import * as path from 'path';

export class PathNormalizer {
  private static userHome = os.homedir();

  /**
   * Replaces absolute local paths with universal place-holders.
   * e.g. /Users/eray/Desktop/Project -> ${USER_HOME}/Desktop/Project
   * e.g. C:\Users\John\Desktop\Project -> ${USER_HOME}/Desktop/Project
   */
  public static normalize(inputPath: string): string {
    if (!inputPath) return inputPath;

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
  public static denormalize(inputPath: string): string {
    if (!inputPath) return inputPath;

    // Use forward slashes for user home to ensure JSON strings remain valid on all OSes
    const normalizedHome = this.userHome.replace(/\\/g, '/');
    return inputPath.replace(/\${USER_HOME}/g, normalizedHome);
  }
}
