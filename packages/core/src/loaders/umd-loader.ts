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
            options?.exports,
            options?.globalNamespace,
            options?.expozrName,
            options?.cargoName
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
    requestedExports?: string[],
    globalNamespace?: string,
    expozrName?: string,
    cargoName?: string
  ): T {
    // Find newly added globals
    const afterGlobals = Object.keys(globalThis as any);
    const newGlobals = afterGlobals.filter((key) => !beforeGlobals.has(key));

    let moduleToReturn: any = null;

    // Strategy 1: If globalNamespace is provided, check if it exists (even if not "new")
    if (globalNamespace && (globalThis as any)[globalNamespace]) {
      moduleToReturn = (globalThis as any)[globalNamespace];
    }
    // Strategy 2: Fall back to checking new globals
    else if (newGlobals.length > 0) {
      // Filter out obvious non-module globals that might be from Chrome extensions or webpack
      const filteredGlobals = newGlobals.filter(
        (key) =>
          !key.startsWith("__EXPOZR__") &&
          !key.startsWith("webpackChunk") &&
          !key.startsWith("__webpack") &&
          !key.startsWith("webpackHotUpdate") && // Filter out webpack HMR functions
          !key.startsWith("chrome") &&
          !key.startsWith("__REACT_DEVTOOLS") &&
          !key.startsWith("__VUE_DEVTOOLS") &&
          !key.startsWith("__TAG_ASSISTANT") &&
          !key.startsWith("__REDUX_DEVTOOLS") &&
          key !== "__REACT_DEVTOOLS_GLOBAL_HOOK__"
      );

      if (filteredGlobals.length > 0) {
        // Prefer the global that matches cargoName if available
        let selectedGlobal = filteredGlobals[0];
        if (cargoName) {
          const cargoBaseName = cargoName.replace("./", ""); // Remove ./ prefix
          const matchingGlobal = filteredGlobals.find(
            (key) => key === cargoBaseName
          );
          if (matchingGlobal) {
            selectedGlobal = matchingGlobal;
          }
        }

        moduleToReturn = (globalThis as any)[selectedGlobal];
      } else {
        // No suitable globals found, will throw error below
      }
    }
    // Strategy 3: If no globalNamespace provided, try using cargoName as fallback
    else if (!globalNamespace && cargoName && (globalThis as any)[cargoName]) {
      moduleToReturn = (globalThis as any)[cargoName];
    }

    if (!moduleToReturn) {
      throw new Error(
        `No module found after loading UMD script. Expected: ${globalNamespace || cargoName || "unknown"}, New globals: ${newGlobals.join(", ")}`
      );
    }

    // Validate that the module has the expected structure
    if (
      typeof moduleToReturn !== "object" &&
      typeof moduleToReturn !== "function"
    ) {
      console.error(
        `❌ Invalid module type:`,
        typeof moduleToReturn,
        moduleToReturn
      );
      throw new Error(
        `Invalid module: expected object or function, got ${typeof moduleToReturn}`
      );
    }

    // ALWAYS implement the standardized global binding system with protection
    if (expozrName && cargoName) {
      // Initialize the global __EXPOZR__ structure if it doesn't exist or is corrupted
      if (
        !(globalThis as any).__EXPOZR__ ||
        typeof (globalThis as any).__EXPOZR__ !== "object"
      ) {
        // Create a protected __EXPOZR__ object
        const expozrObject = {};

        // Define it as non-configurable and non-writable to prevent extension interference
        Object.defineProperty(globalThis, "__EXPOZR__", {
          value: expozrObject,
          writable: false,
          enumerable: true,
          configurable: false,
        });
      }

      if (
        !(globalThis as any).__EXPOZR__[expozrName] ||
        typeof (globalThis as any).__EXPOZR__[expozrName] !== "object"
      ) {
        const expozrEntry = { CARGOS: {} };

        // Define the expozr entry as non-configurable
        Object.defineProperty((globalThis as any).__EXPOZR__, expozrName, {
          value: expozrEntry,
          writable: false,
          enumerable: true,
          configurable: false,
        });
      }

      if (
        !(globalThis as any).__EXPOZR__[expozrName].CARGOS ||
        typeof (globalThis as any).__EXPOZR__[expozrName].CARGOS !== "object"
      ) {
        const cargosObject = {};

        // Define CARGOS as non-configurable but writable (so we can add cargos)
        Object.defineProperty(
          (globalThis as any).__EXPOZR__[expozrName],
          "CARGOS",
          {
            value: cargosObject,
            writable: false,
            enumerable: true,
            configurable: false,
          }
        );
      }

      // ALWAYS bind the module to the standardized location
      // Use defineProperty to make it harder for extensions to override
      Object.defineProperty(
        (globalThis as any).__EXPOZR__[expozrName].CARGOS,
        cargoName,
        {
          value: moduleToReturn,
          writable: true, // Allow updates for HMR
          enumerable: true,
          configurable: true, // Allow reconfiguration for HMR
        }
      );

      // OPTIONAL: Also bind to globalNamespace if provided (for backward compatibility/convenience)
      if (globalNamespace && !(globalThis as any)[globalNamespace]) {
        (globalThis as any)[globalNamespace] = moduleToReturn;
      }
    }

    // Extract specific exports if requested
    if (requestedExports && requestedExports.length > 0) {
      // ALWAYS prefer module from standardized location if available
      let sourceModule = moduleToReturn;
      if (
        expozrName &&
        cargoName &&
        (globalThis as any).__EXPOZR__?.[expozrName]?.CARGOS?.[cargoName]
      ) {
        sourceModule = (globalThis as any).__EXPOZR__[expozrName].CARGOS[
          cargoName
        ];
      }

      const result: any = {};
      for (const exportName of requestedExports) {
        if (sourceModule && sourceModule[exportName]) {
          result[exportName] = sourceModule[exportName];
        } else {
          // Export not found, but continue processing
        }
      }

      return result as T;
    }

    // Return the entire module - ALWAYS prefer standardized location if available
    let finalModule = moduleToReturn;
    if (
      expozrName &&
      cargoName &&
      (globalThis as any).__EXPOZR__?.[expozrName]?.CARGOS?.[cargoName]
    ) {
      finalModule = (globalThis as any).__EXPOZR__[expozrName].CARGOS[
        cargoName
      ];
    }

    return finalModule as T;
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
