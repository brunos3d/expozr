/**
 * Node.js-based module loader
 */

import type { ModuleLoader, LoadOptions, ModuleFormat } from "@expozr/core";
import {
  LoadTimeoutError,
  NetworkError,
  createTimeout,
  retry,
} from "@expozr/core";

/**
 * Node.js-based module loader
 * Optimized for Node.js environments with support for CommonJS and ESM
 */
export class NodeModuleLoader implements ModuleLoader {
  private loadedModules = new Map<string, any>();

  /**
   * Load a module in the Node.js environment
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
            this.loadNodeModule(url),
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
   * Load a module in Node.js environment
   * @param url - URL or path to load
   * @returns Promise resolving to the loaded module
   */
  private async loadNodeModule(url: string): Promise<any> {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // For HTTP URLs, fetch and evaluate
      const module = await this.fetchModule(url);
      return module;
    } else {
      // For local files, use require or import
      try {
        return await import(
          /* webpackIgnore: true */
          /* @vite-ignore */
          url
        );
      } catch {
        // Fallback to require for CommonJS modules (Node.js only)
        if (typeof globalThis !== "undefined" && "require" in globalThis) {
          return (globalThis as any).require(url);
        }
        throw new Error("Module loading failed");
      }
    }
  }

  /**
   * Fetch and evaluate a remote module
   * @param url - Remote URL to fetch
   * @returns Promise resolving to the module
   */
  private async fetchModule(url: string): Promise<any> {
    // This would need a proper implementation with dynamic evaluation
    // For now, throwing as HTTP module loading in Node.js requires special handling
    throw new Error("HTTP module loading in Node.js not implemented yet");
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
    // In Node.js, preloading might involve warming up the require cache
    // For now, we'll just load the module without executing it
    try {
      await this.loadModule(url, { cache: true });
    } catch {
      // Ignore preload errors
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
    return ["esm", "cjs"];
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
   * Check if we're running in Node.js environment
   * @returns True if running in Node.js
   */
  static isSupported(): boolean {
    return (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node !== undefined
    );
  }
}
