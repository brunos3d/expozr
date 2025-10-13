/**
 * Bundler utility functions for configuration merging and path handling
 */

/**
 * Utility functions for bundler adapters
 */
export class BundlerUtils {
  /**
   * Merge multiple bundler configurations with deep merging
   */
  static mergeConfigs(...configs: any[]): any {
    return configs.reduce((merged, config) => {
      if (!config) return merged;
      return this.deepMerge(merged, config);
    }, {});
  }

  /**
   * Deep merge two objects recursively
   */
  static deepMerge(target: any, source: any): any {
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    return target;
  }

  /**
   * Check if a value is a plain object
   */
  private static isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * Normalize module path for cross-platform compatibility
   */
  static normalizePath(path: string): string {
    return path.replace(/\\/g, "/");
  }

  /**
   * Calculate relative path between two absolute paths
   */
  static getRelativePath(from: string, to: string): string {
    const fromParts = this.normalizePath(from).split("/");
    const toParts = this.normalizePath(to).split("/");

    // Find common path length
    let commonLength = 0;
    for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }

    // Calculate relative path
    const upCount = fromParts.length - commonLength - 1;
    const relativeParts = Array(upCount)
      .fill("..")
      .concat(toParts.slice(commonLength));

    return relativeParts.join("/") || ".";
  }

  /**
   * Resolve module specifier with alias support
   */
  static resolveModuleSpecifier(
    specifier: string,
    baseUrl: string,
    alias?: Record<string, string>
  ): string {
    // Apply alias transformation if available
    if (alias && alias[specifier]) {
      return alias[specifier];
    }

    // Handle relative imports
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      try {
        return new URL(specifier, baseUrl).href;
      } catch {
        // Fallback for invalid URLs
        return this.joinPaths(baseUrl, specifier);
      }
    }

    // Handle absolute imports
    if (specifier.startsWith("/")) {
      try {
        return new URL(specifier, baseUrl).href;
      } catch {
        return specifier;
      }
    }

    // Handle bare imports (npm packages)
    return specifier;
  }

  /**
   * Join URL paths safely
   */
  static joinPaths(...parts: string[]): string {
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
   * Extract directory path from a file path
   */
  static getDirectoryPath(filePath: string): string {
    const normalizedPath = this.normalizePath(filePath);
    const lastSlashIndex = normalizedPath.lastIndexOf("/");
    return lastSlashIndex >= 0
      ? normalizedPath.substring(0, lastSlashIndex)
      : "";
  }

  /**
   * Extract filename from a file path
   */
  static getFileName(filePath: string): string {
    const normalizedPath = this.normalizePath(filePath);
    const lastSlashIndex = normalizedPath.lastIndexOf("/");
    return lastSlashIndex >= 0
      ? normalizedPath.substring(lastSlashIndex + 1)
      : normalizedPath;
  }

  /**
   * Get file extension from a file path
   */
  static getFileExtension(filePath: string): string {
    const fileName = this.getFileName(filePath);
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex >= 0 ? fileName.substring(lastDotIndex) : "";
  }

  /**
   * Remove file extension from a file path
   */
  static removeFileExtension(filePath: string): string {
    const extension = this.getFileExtension(filePath);
    return extension ? filePath.slice(0, -extension.length) : filePath;
  }

  /**
   * Check if a path is absolute
   */
  static isAbsolutePath(path: string): boolean {
    return (
      path.startsWith("/") ||
      /^[a-zA-Z]:/.test(path) ||
      path.startsWith("file://")
    );
  }

  /**
   * Convert relative path to absolute based on a base path
   */
  static toAbsolutePath(relativePath: string, basePath: string): string {
    if (this.isAbsolutePath(relativePath)) {
      return relativePath;
    }
    return this.joinPaths(basePath, relativePath);
  }
}
