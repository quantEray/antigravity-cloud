import * as os from 'os';

export class PathNormalizer {
  public static getNormalizedHome(): string {
    return os.homedir().replace(/\\/g, '/');
  }

  /**
   * Replaces all occurrences of local user home in text content with universal ${USER_HOME}.
   * Handles forward-slash paths, Windows backslash paths, and URL-encoded paths.
   */
  public static normalize(content: string): string {
    if (!content) return content;

    const normalizedHome = this.getNormalizedHome();
    let result = content;

    // 1. Replace forward-slash home paths (e.g. /Users/eray or C:/Users/Asus)
    result = result.split(normalizedHome).join('${USER_HOME}');

    // 2. Replace Windows backslash home if different (e.g. C:\Users\Asus)
    const backslashHome = os.homedir().replace(/\//g, '\\');
    if (backslashHome !== normalizedHome) {
      result = result.split(backslashHome).join('${USER_HOME}');
    }

    // 3. Replace URI-encoded forms (e.g. file:///Users/eray or file:///c%3A/Users/...)
    try {
      const uriHome = encodeURI(normalizedHome);
      if (uriHome !== normalizedHome) {
        result = result.split(uriHome).join('${USER_HOME}');
      }
    } catch {}

    return result;
  }

  /**
   * Restores universal ${USER_HOME} placeholders with current local OS absolute home directory.
   */
  public static denormalize(content: string): string {
    if (!content) return content;

    const normalizedHome = this.getNormalizedHome();
    return content.split('${USER_HOME}').join(normalizedHome);
  }
}
