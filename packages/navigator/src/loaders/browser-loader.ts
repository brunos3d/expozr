/**
 * Browser-based module loader using dynamic imports
 */

import type { ModuleLoader, LoadOptions, ModuleFormat } from "@expozr/core";
import {
  LoadTimeoutError,
  NetworkError,
  createTimeout,
  retry,
} from "@expozr/core";

/**
 * Browser-based module loader using dynamic imports
 * Optimized for browser environments with support for various module formats
 */
export class BrowserModuleLoader implements ModuleLoader {
  private loadedModules = new Map<string, any>();

  /**
   * Load a module in the browser environment
   * @param url - URL of the module to load
   * @param options - Loading options
   * @returns Promise resolving to the loaded module
   */
  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    const cacheKey = url;

    // Check if module is already loaded
    if (options?.cache !== false && this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey);
    }

    const timeout = options?.timeout || 30000;
    const retryConfig = options?.retry || { attempts: 3, delay: 1000 };

    try {
      const module = await retry(
        async () => {
          return Promise.race([
            this.dynamicImport(url),
            createTimeout(timeout),
          ]);
        },
        retryConfig.attempts,
        retryConfig.delay,
        retryConfig.backoff
      );

      // Cache the loaded module
      if (options?.cache !== false) {
        this.loadedModules.set(cacheKey, module);
      }

      return module;
    } catch (error) {
      if (options?.fallback) {
        return options.fallback();
      }

      if (error instanceof Error && error.message.includes("timed out")) {
        throw new LoadTimeoutError(url, timeout);
      }

      throw new NetworkError(url, error as Error);
    }
  }

  /**
   * Perform dynamic import with format detection
   * @param url - URL to import
   * @returns Promise resolving to the imported module
   */
  private async dynamicImport(url: string): Promise<any> {
    // Handle different module formats
    if (url.endsWith(".json")) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }

    // For JavaScript modules, use dynamic import
    return import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      url
    );
  }

  /**
   * Check if a module is already loaded
   * @param url - Module URL
   * @returns True if module is loaded
   */
  isModuleLoaded(url: string): boolean {
    return this.loadedModules.has(url);
  }

  /**
   * Preload a module for faster access later
   * @param url - Module URL to preload
   */
  async preloadModule(url: string): Promise<void> {
    // For browsers, we can use <link rel="modulepreload">
    if (typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = url;
      document.head.appendChild(link);
    }
  }

  /**
   * Clear the module cache
   */
  clearCache(): void {
    this.loadedModules.clear();
  }

  /**
   * Get supported module formats
   * @returns Array of supported formats
   */
  getSupportedFormats(): ModuleFormat[] {
    return ["esm", "umd"];
  }

  /**
   * Get cache statistics
   * @returns Object with cache information
   */
  getCacheStats() {
    return {
      size: this.loadedModules.size,
      keys: Array.from(this.loadedModules.keys()),
    };
  }

  /**
   * Check if the browser supports dynamic imports
   * @returns True if dynamic imports are supported
   */
  static isSupported(): boolean {
    try {
      // Test if dynamic import is available
      new Function('return import("data:text/javascript,export default 1");');
      return true;
    } catch {
      return false;
    }
  }
}
