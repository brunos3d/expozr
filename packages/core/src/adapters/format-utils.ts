/**
 * Utility functions for module format handling
 */

import type { ModuleFormat } from "../types";

/**
 * Utility class for handling module format operations
 */
export class ModuleFormatUtils {
  /**
   * Get file extension for a given module format
   */
  static getExtensionForFormat(format: ModuleFormat): string {
    switch (format) {
      case "esm":
        return ".mjs";
      case "umd":
        return ".umd.js";
      case "cjs":
        return ".cjs";
      case "amd":
        return ".amd.js";
      case "iife":
        return ".iife.js";
      case "system":
        return ".system.js";
      default:
        return ".js";
    }
  }

  /**
   * Check if a format is supported in the current environment
   */
  static isFormatSupported(format: ModuleFormat): boolean {
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
   * Get the optimal format for the current environment
   */
  static getOptimalFormat(availableFormats: ModuleFormat[]): ModuleFormat {
    // Priority order based on environment capabilities
    const priorityOrder: ModuleFormat[] = [
      "esm",
      "umd",
      "cjs",
      "amd",
      "iife",
      "system",
    ];

    for (const format of priorityOrder) {
      if (availableFormats.includes(format) && this.isFormatSupported(format)) {
        return format;
      }
    }

    // Fallback to the first available format
    return availableFormats[0] || "esm";
  }

  /**
   * Detect module format from URL or content
   */
  static detectFormatFromUrl(url: string): ModuleFormat | null {
    const urlLower = url.toLowerCase();

    if (urlLower.includes(".mjs") || urlLower.includes(".esm.")) {
      return "esm";
    }

    if (urlLower.includes(".umd.") || urlLower.includes("umd")) {
      return "umd";
    }

    if (urlLower.includes(".cjs") || urlLower.includes("commonjs")) {
      return "cjs";
    }

    if (urlLower.includes(".amd.") || urlLower.includes("amd")) {
      return "amd";
    }

    if (urlLower.includes(".iife.") || urlLower.includes("iife")) {
      return "iife";
    }

    if (urlLower.includes(".system.") || urlLower.includes("system")) {
      return "system";
    }

    return null;
  }

  /**
   * Check if ESM is supported in the current environment
   */
  private static supportsESM(): boolean {
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

  /**
   * Normalize module URL for a specific format
   */
  static normalizeUrlForFormat(url: string, format: ModuleFormat): string {
    const extension = this.getExtensionForFormat(format);

    // Remove existing extension and add the format-specific one
    const baseUrl = url.replace(/\.[^.]+$/, "");
    return `${baseUrl}${extension}`;
  }

  /**
   * Get MIME type for a module format
   */
  static getMimeType(format: ModuleFormat): string {
    switch (format) {
      case "esm":
        return "application/javascript";
      case "umd":
      case "iife":
      case "amd":
      case "system":
        return "application/javascript";
      case "cjs":
        return "application/javascript";
      default:
        return "application/javascript";
    }
  }
}
