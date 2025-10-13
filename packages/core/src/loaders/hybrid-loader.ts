/**
 * Hybrid module loader that supports multiple formats
 */

import { BaseModuleLoader } from "./base-loader";
import { ESMModuleLoader } from "./esm-loader";
import { UMDModuleLoader } from "./umd-loader";
import type { ModuleFormat, LoadOptions } from "../types";

/**
 * Hybrid loader that tries multiple formats in order of preference
 */
export class HybridModuleLoader extends BaseModuleLoader {
  protected format: ModuleFormat = "esm"; // Primary format

  private readonly esmLoader = new ESMModuleLoader();
  private readonly umdLoader = new UMDModuleLoader();
  private readonly formatOrder: ModuleFormat[] = ["esm", "umd"];

  /**
   * Load module by trying different formats in order
   */
  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    const normalizedUrl = this.normalizeUrl(url);
    const cacheKey = normalizedUrl;

    // Check cache first
    if (options?.cache !== false) {
      const cached = this.getCachedModule<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const errors: Error[] = [];

    // Try each format in order
    for (const format of this.formatOrder) {
      try {
        const loader = this.getLoaderForFormat(format);
        const formatUrl = this.convertUrlForFormat(normalizedUrl, format);

        const module = await this.withTimeout(
          loader.loadModule<T>(formatUrl, options),
          options?.timeout
        );

        // Cache the successfully loaded module
        if (options?.cache !== false) {
          this.setCachedModule(cacheKey, module);
        }

        return module;
      } catch (error) {
        errors.push(error as Error);
        continue; // Try next format
      }
    }

    // If all formats failed, throw combined error
    throw new Error(
      `Failed to load module from ${url} using any format. Errors: ${errors
        .map((e) => e.message)
        .join("; ")}`
    );
  }

  /**
   * Get loader instance for specific format
   */
  private getLoaderForFormat(format: ModuleFormat): BaseModuleLoader {
    switch (format) {
      case "esm":
        return this.esmLoader;
      case "umd":
        return this.umdLoader;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Convert URL to format-specific URL
   */
  private convertUrlForFormat(url: string, format: ModuleFormat): string {
    const baseUrl = this.removeExtension(url);

    switch (format) {
      case "esm":
        return `${baseUrl}.mjs`;
      case "umd":
        return `${baseUrl}.umd.js`;
      default:
        return url;
    }
  }

  /**
   * Remove file extension from URL
   */
  private removeExtension(url: string): string {
    const queryIndex = url.indexOf("?");
    const cleanUrl = queryIndex >= 0 ? url.substring(0, queryIndex) : url;
    const lastDotIndex = cleanUrl.lastIndexOf(".");
    const lastSlashIndex = cleanUrl.lastIndexOf("/");

    // Only remove extension if dot appears after last slash
    if (lastDotIndex > lastSlashIndex) {
      const baseUrl = cleanUrl.substring(0, lastDotIndex);
      const query = queryIndex >= 0 ? url.substring(queryIndex) : "";
      return baseUrl + query;
    }

    return url;
  }

  /**
   * Get all supported formats
   */
  getSupportedFormats(): ModuleFormat[] {
    return [...this.formatOrder];
  }

  /**
   * Clear cache for all loaders
   */
  clearCache(): void {
    super.clearCache();
    this.esmLoader.clearCache();
    this.umdLoader.clearCache();
  }

  /**
   * Check if hybrid loading is supported
   */
  static isSupported(): boolean {
    return ESMModuleLoader.isSupported() || UMDModuleLoader.isSupported();
  }

  /**
   * Set custom format order for loading attempts
   */
  setFormatOrder(formats: ModuleFormat[]): void {
    this.formatOrder.length = 0;
    this.formatOrder.push(...formats);
  }

  /**
   * Get current format order
   */
  getFormatOrder(): ModuleFormat[] {
    return [...this.formatOrder];
  }

  /**
   * Preload module using the first available format
   */
  async preloadModule(url: string): Promise<void> {
    if (!this.isModuleLoaded(url)) {
      try {
        // Try to preload with the primary format first
        const primaryLoader = this.getLoaderForFormat(this.formatOrder[0]);
        const primaryUrl = this.convertUrlForFormat(url, this.formatOrder[0]);
        await primaryLoader.preloadModule(primaryUrl);
      } catch {
        // Ignore preload errors
      }
    }
  }
}
