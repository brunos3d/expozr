/**
 * UMD (Universal Module Definition) loader implementation
 */

import { BaseModuleLoader } from "./base-loader";
import type { ModuleFormat, LoadOptions } from "../types";

/**
 * Loader for UMD (Universal Module Definition) modules
 */
export class UMDModuleLoader extends BaseModuleLoader {
  protected format: ModuleFormat = "umd";

  /**
   * Load a UMD module using script injection (browser) or require (Node.js)
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

    try {
      const module = await this.withTimeout(
        this.loadUMDModule<T>(normalizedUrl, options),
        options?.timeout
      );

      // Cache the loaded module
      if (options?.cache !== false) {
        this.setCachedModule(cacheKey, module);
      }

      return module;
    } catch (error) {
      throw new Error(
        `Failed to load UMD module from ${url}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Internal UMD loading implementation
   */
  private async loadUMDModule<T = any>(
    url: string,
    options?: LoadOptions
  ): Promise<T> {
    if (this.isNodeEnvironment()) {
      return this.loadUMDInNode<T>(url, options);
    } else {
      return this.loadUMDInBrowser<T>(url, options);
    }
  }

  /**
   * Load UMD module in browser environment using script injection
   */
  private async loadUMDInBrowser<T = any>(
    url: string,
    options?: LoadOptions
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Store current global state
      const beforeGlobals = new Set(Object.keys(globalThis as any));

      const script = document.createElement("script");
      script.src = url;
      script.async = true;

      script.onload = () => {
        try {
          const module = this.extractGlobalModule<T>(
            beforeGlobals,
            options?.exports
          );
          script.remove();
          resolve(module);
        } catch (error) {
          script.remove();
          reject(error);
        }
      };

      script.onerror = () => {
        script.remove();
        reject(new Error(`Failed to load script: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load UMD module in Node.js environment
   */
  private async loadUMDInNode<T = any>(
    url: string,
    options?: LoadOptions
  ): Promise<T> {
    try {
      // Try dynamic import first
      const module = await import(
        /* webpackIgnore: true */
        /* @vite-ignore */
        url
      );
      return this.extractModuleExports<T>(module, options?.exports);
    } catch (error) {
      // Fallback to require if available
      if (typeof require !== "undefined") {
        try {
          const module = require(url);
          return this.extractModuleExports<T>(module, options?.exports);
        } catch (requireError) {
          throw new Error(
            `Failed to load UMD module with both import and require: ${error}`
          );
        }
      }
      throw error;
    }
  }

  /**
   * Extract module from global scope after script loading
   */
  private extractGlobalModule<T = any>(
    beforeGlobals: Set<string>,
    requestedExports?: string[]
  ): T {
    // Find newly added globals
    const afterGlobals = Object.keys(globalThis as any);
    const newGlobals = afterGlobals.filter((key) => !beforeGlobals.has(key));

    if (newGlobals.length === 0) {
      throw new Error("No new globals found after loading UMD module");
    }

    // If specific exports requested, extract them
    if (requestedExports && requestedExports.length > 0) {
      const result: any = {};
      for (const exportName of requestedExports) {
        if (newGlobals.includes(exportName)) {
          result[exportName] = (globalThis as any)[exportName];
        }
      }
      return result as T;
    }

    // Return the first new global (most likely the module)
    const mainGlobal = newGlobals[0];
    return (globalThis as any)[mainGlobal] as T;
  }

  /**
   * Extract specific exports from loaded module
   */
  private extractModuleExports<T = any>(
    module: any,
    requestedExports?: string[]
  ): T {
    if (!requestedExports || requestedExports.length === 0) {
      return (module.default || module) as T;
    }

    if (requestedExports.length === 1) {
      const exportName = requestedExports[0];
      return module[exportName] as T;
    }

    const result: any = {};
    for (const exportName of requestedExports) {
      result[exportName] = module[exportName];
    }
    return result as T;
  }

  /**
   * Check if running in Node.js environment
   */
  private isNodeEnvironment(): boolean {
    return typeof window === "undefined" && typeof process !== "undefined";
  }

  /**
   * Check if UMD is supported in the current environment
   */
  static isSupported(): boolean {
    if (typeof window !== "undefined") {
      // Browser environment - UMD is supported via script tags
      return typeof document !== "undefined";
    } else {
      // Node.js environment - UMD is supported via require or import
      return (
        typeof require !== "undefined" || eval("typeof import") === "function"
      );
    }
  }

  /**
   * Preload UMD module without caching
   */
  async preloadModule(url: string): Promise<void> {
    if (!this.isModuleLoaded(url)) {
      try {
        await this.loadModule(url, { cache: false });
      } catch {
        // Ignore preload errors
      }
    }
  }
}
