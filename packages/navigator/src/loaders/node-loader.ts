/**
 * Node.js-based module loader
 */
import * as vm from "vm";
import * as https from "https";
import * as http from "http";

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
  private async loadNodeModule<T = any>(url: string): Promise<T> {
    return this.fetchModule<T>(url);
  }

  /**
   * Fetch and evaluate a remote module
   * @param url - Remote URL to fetch
   * @returns Promise resolving to the module
   */
  private async fetchModule<T = any>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      console.log(`🌐 Fetching UMD module from: ${url}`);

      const client = url.startsWith("https:") ? https : http;

      client
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            return;
          }

          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              // Create mock browser APIs
              const mockEventTarget = {
                addEventListener: () => {},
                removeEventListener: () => {},
                dispatchEvent: () => true,
              };

              const mockLocation = {
                href: url,
                protocol: new URL(url).protocol,
                host: new URL(url).host,
                hostname: new URL(url).hostname,
                port: new URL(url).port,
                pathname: new URL(url).pathname,
                search: "",
                hash: "",
              };

              const mockDocument = {
                ...mockEventTarget,
                createElement: () => mockEventTarget,
                createTextNode: () => ({}),
                querySelector: () => null,
                querySelectorAll: () => [],
                getElementById: () => null,
                getElementsByTagName: () => [],
                body: mockEventTarget,
                head: mockEventTarget,
                documentElement: mockEventTarget,
              };

              const mockWindow = {
                ...mockEventTarget,
                document: mockDocument,
                location: mockLocation,
                navigator: { userAgent: "Node.js" },
                setTimeout,
                clearTimeout,
                setInterval,
                clearInterval,
                fetch: undefined,
                XMLHttpRequest: undefined,
              };

              // Create a safe execution context with proper browser mocks
              const sandbox = {
                module: { exports: {} },
                exports: {},
                require: require,
                console: console,
                setTimeout,
                clearTimeout,
                setInterval,
                clearInterval,
                // Browser globals - all pointing to our mock
                global: mockWindow,
                window: mockWindow,
                self: mockWindow,
                document: mockDocument,
                location: mockLocation,
                navigator: mockWindow.navigator,
                // Make 'this' point to the window mock in global scope
                this: undefined, // Will be set to global context
              };

              // Execute the UMD module in the sandbox
              const context = vm.createContext(sandbox);

              // Wrap in try-catch to handle webpack-dev-server or other client-only code
              const wrappedCode = `
              (function() {
                try {
                  ${data}
                } catch (err) {
                  // Suppress errors from browser-only code (like webpack-dev-server)
                  if (err.message && (
                    err.message.includes('addEventListener') ||
                    err.message.includes('document') ||
                    err.message.includes('window')
                  )) {
                    console.warn('⚠️ Browser-only code detected, skipping:', err.message);
                  } else {
                    throw err;
                  }
                }
              })();
            `;

              vm.runInContext(wrappedCode, context);

              // Extract the module exports
              const moduleExports: any =
                sandbox.module.exports || sandbox.exports || {};

              // Check if we got valid exports
              if (
                Object.keys(moduleExports).length === 0 &&
                moduleExports.constructor === Object
              ) {
                console.warn(
                  `⚠️ Warning: No exports found in UMD module from: ${url}`
                );
                console.warn(
                  `   This might be a client-only bundle (webpack-dev-server).`
                );
              }

              console.log(`✅ Successfully loaded UMD module from: ${url}`);
              resolve(moduleExports as T);
            } catch (error) {
              console.error(`❌ Failed to execute UMD module: ${error}`);
              reject(error);
            }
          });
        })
        .on("error", (error) => {
          console.error(`❌ Failed to fetch UMD module: ${error}`);
          reject(error);
        });
    });
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
