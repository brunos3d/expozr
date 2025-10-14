/**
 * ESM (ECMAScript Module) loader implementation
 */

import { BaseModuleLoader } from "./base-loader";
import type { ModuleFormat, LoadOptions } from "../types";

/**
 * Loader for ECMAScript Modules (ESM)
 */
export class ESMModuleLoader extends BaseModuleLoader {
  protected format: ModuleFormat = "esm";

  /**
   * Load an ESM module using dynamic import
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
        this.loadESMModule<T>(normalizedUrl, options),
        options?.timeout
      );

      // Cache the loaded module
      if (options?.cache !== false) {
        this.setCachedModule(cacheKey, module);
      }

      return module;
    } catch (error) {
      throw new Error(
        `Failed to load ESM module from ${url}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Internal ESM loading implementation
   */
  private async loadESMModule<T = any>(
    url: string,
    options?: LoadOptions
  ): Promise<T> {
    // Ensure URL is properly formatted for ESM
    const esmUrl = this.normalizeESMUrl(url, options);

    // Use dynamic import with retry mechanism
    const module = await this.withRetry(
      () =>
        import(
          /* webpackIgnore: true */
          /* @vite-ignore */
          esmUrl
        ),
      options?.retry?.attempts,
      options?.retry?.delay,
      options?.retry?.backoff
    );

    // Return the module (handle both default and named exports)
    return this.extractModuleExports(
      module,
      options?.exports,
      options?.expozrName,
      options?.cargoName
    );
  }

  /**
   * Normalize URL for ESM loading
   */
  private normalizeESMUrl(url: string, options?: LoadOptions): string {
    let normalizedUrl = url;

    // Add .mjs extension if no extension is present
    if (!this.hasExtension(normalizedUrl)) {
      normalizedUrl += ".mjs";
    }

    // Add cache busting if needed
    if (options?.cacheBusting !== false) {
      normalizedUrl = this.addCacheBusting(normalizedUrl);
    }

    return normalizedUrl;
  }

  /**
   * Extract specific exports from loaded module
   */
  private extractModuleExports<T = any>(
    module: any,
    requestedExports?: string[],
    expozrName?: string,
    cargoName?: string
  ): T {
    let moduleToReturn: any;

    if (!requestedExports || requestedExports.length === 0) {
      // Return default export if available, otherwise the entire module
      moduleToReturn = (module.default || module) as T;
    } else if (requestedExports.length === 1) {
      // Return single export
      const exportName = requestedExports[0];
      moduleToReturn = module[exportName] as T;
    } else {
      // Return object with requested exports
      const result: any = {};
      for (const exportName of requestedExports) {
        result[exportName] = module[exportName];
      }
      moduleToReturn = result as T;
    }

    // Implement the standardized global binding system (same as UMD)
    if (expozrName && cargoName && moduleToReturn) {
      // Initialize the global __EXPOZR__ structure if it doesn't exist
      if (!(globalThis as any).__EXPOZR__) {
        (globalThis as any).__EXPOZR__ = {};
      }

      if (!(globalThis as any).__EXPOZR__[expozrName]) {
        (globalThis as any).__EXPOZR__[expozrName] = { CARGOS: {} };
      }

      if (!(globalThis as any).__EXPOZR__[expozrName].CARGOS) {
        (globalThis as any).__EXPOZR__[expozrName].CARGOS = {};
      }

      // Bind the module to the standardized location
      (globalThis as any).__EXPOZR__[expozrName].CARGOS[cargoName] =
        moduleToReturn;

      console.log(
        `📦 ESM Module bound to globalThis.__EXPOZR__.${expozrName}.CARGOS.${cargoName}`
      );
    }

    return moduleToReturn;
  }

  /**
   * Check if ESM is supported in the current environment
   */
  static isSupported(): boolean {
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
   * Preload module by just resolving the import without caching
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
