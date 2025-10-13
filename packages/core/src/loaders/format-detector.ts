/**
 * Format detection utilities for module loaders
 */

import type { ModuleFormat, ModuleFormatDetector } from "../types";

/**
 * Default format detector based on URL patterns and environment capabilities
 */
export class DefaultFormatDetector implements ModuleFormatDetector {
  /**
   * Detect module format from URL or content analysis
   */
  async detectFormat(urlOrContent: string): Promise<ModuleFormat | null> {
    const detection = this.detectFromUrl(urlOrContent);
    if (detection) {
      return detection;
    }

    // If no URL-based detection, fall back to environment-based detection
    return this.detectFromEnvironment();
  }

  /**
   * Detect format from URL patterns
   */
  private detectFromUrl(url: string): ModuleFormat | null {
    const urlLower = url.toLowerCase();

    // ESM patterns
    if (urlLower.includes(".mjs") || urlLower.includes(".esm.")) {
      return "esm";
    }

    // UMD patterns
    if (urlLower.includes(".umd.") || urlLower.includes("umd")) {
      return "umd";
    }

    // CommonJS patterns
    if (urlLower.includes(".cjs") || urlLower.includes("commonjs")) {
      return "cjs";
    }

    // AMD patterns
    if (urlLower.includes(".amd.") || urlLower.includes("amd")) {
      return "amd";
    }

    // IIFE patterns
    if (urlLower.includes(".iife.") || urlLower.includes("iife")) {
      return "iife";
    }

    // SystemJS patterns
    if (urlLower.includes(".system.") || urlLower.includes("system")) {
      return "system";
    }

    return null;
  }

  /**
   * Detect optimal format based on environment capabilities
   */
  private detectFromEnvironment(): ModuleFormat | null {
    if (this.supportsESM()) {
      return "esm";
    }

    if (typeof window !== "undefined") {
      return "umd"; // Browser fallback
    }

    if (typeof require !== "undefined") {
      return "cjs"; // Node.js fallback
    }

    return null;
  }

  /**
   * Check if a specific format is supported in the current environment
   */
  isFormatSupported(format: ModuleFormat): boolean {
    switch (format) {
      case "esm":
        return this.supportsESM();
      case "umd":
      case "iife":
        return typeof window !== "undefined";
      case "cjs":
        return typeof require !== "undefined";
      case "amd":
        return (
          typeof (globalThis as any).define !== "undefined" &&
          !!(globalThis as any).define.amd
        );
      case "system":
        return typeof (globalThis as any).System !== "undefined";
      default:
        return false;
    }
  }

  /**
   * Get optimal format from a list of available formats
   */
  getOptimalFormat(availableFormats: ModuleFormat[]): ModuleFormat {
    const priorityOrder: ModuleFormat[] = [
      "esm",
      "umd",
      "cjs",
      "amd",
      "iife",
      "system",
    ];

    // Find the highest priority format that is both available and supported
    for (const format of priorityOrder) {
      if (availableFormats.includes(format) && this.isFormatSupported(format)) {
        return format;
      }
    }

    // Fallback to the first available format
    return availableFormats[0] || "esm";
  }

  /**
   * Check if ESM is supported in the current environment
   */
  private supportsESM(): boolean {
    if (typeof window !== "undefined") {
      // Browser environment
      try {
        new Function("import('')");
        return true;
      } catch {
        return false;
      }
    } else {
      // Node.js environment
      try {
        return eval("typeof import") === "function";
      } catch {
        return false;
      }
    }
  }
}

/**
 * Content-based format detector that analyzes module content
 */
export class ContentBasedFormatDetector implements ModuleFormatDetector {
  /**
   * Detect format by analyzing the actual module content
   */
  async detectFormat(content: string): Promise<ModuleFormat | null> {
    // ESM indicators
    if (this.hasESMPatterns(content)) {
      return "esm";
    }

    // UMD indicators
    if (this.hasUMDPatterns(content)) {
      return "umd";
    }

    // CommonJS indicators
    if (this.hasCJSPatterns(content)) {
      return "cjs";
    }

    // AMD indicators
    if (this.hasAMDPatterns(content)) {
      return "amd";
    }

    // IIFE indicators
    if (this.hasIIFEPatterns(content)) {
      return "iife";
    }

    return null;
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format: ModuleFormat): boolean {
    const detector = new DefaultFormatDetector();
    return detector.isFormatSupported(format);
  }

  /**
   * Get optimal format from available formats
   */
  getOptimalFormat(availableFormats: ModuleFormat[]): ModuleFormat {
    const detector = new DefaultFormatDetector();
    return detector.getOptimalFormat(availableFormats);
  }

  /**
   * Detect ESM patterns in content
   */
  private hasESMPatterns(content: string): boolean {
    return (
      /^\s*(import|export)\s/m.test(content) ||
      /export\s+default\s/.test(content) ||
      /export\s*\{/.test(content)
    );
  }

  /**
   * Detect UMD patterns in content
   */
  private hasUMDPatterns(content: string): boolean {
    return (
      /typeof\s+exports\s*===\s*['"]object['"]/.test(content) &&
      /typeof\s+define\s*===\s*['"]function['"]/.test(content) &&
      /define\.amd/.test(content)
    );
  }

  /**
   * Detect CommonJS patterns in content
   */
  private hasCJSPatterns(content: string): boolean {
    return (
      /module\.exports\s*=/.test(content) ||
      /exports\.\w+\s*=/.test(content) ||
      /require\s*\(/.test(content)
    );
  }

  /**
   * Detect AMD patterns in content
   */
  private hasAMDPatterns(content: string): boolean {
    return /define\s*\(/.test(content) && !this.hasUMDPatterns(content); // Exclude UMD which also uses define
  }

  /**
   * Detect IIFE patterns in content
   */
  private hasIIFEPatterns(content: string): boolean {
    return (
      /^\s*\(function\s*\(/.test(content) ||
      /^\s*!\s*function\s*\(/.test(content) ||
      /^\s*\+\s*function\s*\(/.test(content)
    );
  }
}
