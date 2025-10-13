/**
 * Module loaders for different environments
 */

import type { ModuleLoader, LoadOptions } from "@expozr/core";
import {
  LoadTimeoutError,
  NetworkError,
  createTimeout,
  retry,
} from "@expozr/core";

/**
 * Browser-based module loader using dynamic imports
 */
export class BrowserModuleLoader implements ModuleLoader {
  private loadedModules = new Map<string, any>();

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

  isModuleLoaded(url: string): boolean {
    return this.loadedModules.has(url);
  }

  async preloadModule(url: string): Promise<void> {
    // For browsers, we can use <link rel="modulepreload">
    if (typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = url;
      document.head.appendChild(link);
    }
  }

  clearCache(): void {
    this.loadedModules.clear();
  }
}

/**
 * Node.js-based module loader
 */
export class NodeModuleLoader implements ModuleLoader {
  private loadedModules = new Map<string, any>();

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

  private async loadNodeModule(url: string): Promise<any> {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // For HTTP URLs, fetch and evaluate
      const module = await this.fetchModule(url);
      return module;
    } else {
      // For local files, use require or import
      try {
        return await import(/* @vite-ignore */ url);
      } catch {
        // Fallback to require for CommonJS modules (Node.js only)
        if (typeof globalThis !== "undefined" && "require" in globalThis) {
          return (globalThis as any).require(url);
        }
        throw new Error("Module loading failed");
      }
    }
  }

  private async fetchModule(url: string): Promise<any> {
    // This would need a proper implementation with dynamic evaluation
    // For now, throwing as HTTP module loading in Node.js requires special handling
    throw new Error("HTTP module loading in Node.js not implemented yet");
  }

  isModuleLoaded(url: string): boolean {
    return this.loadedModules.has(url);
  }

  async preloadModule(url: string): Promise<void> {
    // In Node.js, preloading might involve warming up the require cache
    // For now, we'll just load the module without executing it
    try {
      await this.loadModule(url, { cache: true });
    } catch {
      // Ignore preload errors
    }
  }

  clearCache(): void {
    this.loadedModules.clear();
  }
}

/**
 * Universal module loader that detects environment
 */
export class UniversalModuleLoader implements ModuleLoader {
  private loader: ModuleLoader;

  constructor() {
    // Auto-detect environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      this.loader = new BrowserModuleLoader();
    } else {
      this.loader = new NodeModuleLoader();
    }
  }

  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    return this.loader.loadModule(url, options);
  }

  isModuleLoaded(url: string): boolean {
    return this.loader.isModuleLoaded(url);
  }

  async preloadModule(url: string): Promise<void> {
    return this.loader.preloadModule(url);
  }

  clearCache(): void {
    this.loader.clearCache();
  }
}
