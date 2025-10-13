/**
 * URL and path manipulation utilities
 */

/**
 * Utility class for URL and path operations
 */
export class UrlUtils {
  /**
   * Normalize URL by ensuring consistent format
   */
  static normalize(url: string): string {
    try {
      return new URL(url).href;
    } catch {
      // Handle relative URLs
      return url.endsWith("/") ? url : `${url}/`;
    }
  }

  /**
   * Join URL paths properly
   */
  static join(...parts: string[]): string {
    return parts
      .map((part, index) => {
        if (index === 0) {
          return part.replace(/\/$/, "");
        }
        return part.replace(/^\//, "").replace(/\/$/, "");
      })
      .filter(Boolean)
      .join("/");
  }

  /**
   * Check if a URL is absolute
   */
  static isAbsolute(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert relative URL to absolute
   */
  static toAbsolute(url: string, base: string): string {
    if (this.isAbsolute(url)) {
      return url;
    }

    try {
      return new URL(url, base).href;
    } catch {
      return this.join(base, url);
    }
  }

  /**
   * Extract base URL from a full URL
   */
  static getBase(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return url;
    }
  }

  /**
   * Extract pathname from URL
   */
  static getPathname(url: string): string {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  /**
   * Add query parameters to URL
   */
  static addQueryParams(url: string, params: Record<string, string>): string {
    const separator = url.includes("?") ? "&" : "?";
    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    return queryString ? `${url}${separator}${queryString}` : url;
  }

  /**
   * Parse query parameters from URL
   */
  static parseQueryParams(url: string): Record<string, string> {
    try {
      const parsed = new URL(url);
      const params: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    } catch {
      return {};
    }
  }

  /**
   * Remove query parameters from URL
   */
  static removeQueryParams(url: string): string {
    const queryIndex = url.indexOf("?");
    return queryIndex >= 0 ? url.substring(0, queryIndex) : url;
  }

  /**
   * Check if URL points to the same origin
   */
  static isSameOrigin(url1: string, url2: string): boolean {
    try {
      const parsed1 = new URL(url1);
      const parsed2 = new URL(url2);
      return parsed1.origin === parsed2.origin;
    } catch {
      return false;
    }
  }

  /**
   * Resolve URL relative to another URL
   */
  static resolve(url: string, base: string): string {
    try {
      return new URL(url, base).href;
    } catch {
      return this.join(base, url);
    }
  }
}
