/**
 * Abstract module loaders for different formats
 */

import type {
  ModuleFormat,
  ModuleLoader,
  LoadOptions,
  ModuleFormatDetector,
} from "./types";
import { NetworkError, LoadTimeoutError } from "./errors";

/**
 * Abstract base class for module loaders
 */
export abstract class BaseModuleLoader implements ModuleLoader {
  protected loadedModules = new Map<string, any>();
  protected abstract format: ModuleFormat;

  abstract loadModule<T = any>(url: string, options?: LoadOptions): Promise<T>;

  isModuleLoaded(url: string): boolean {
    return this.loadedModules.has(url);
  }

  async preloadModule(url: string): Promise<void> {
    // Default implementation - can be overridden
    if (!this.isModuleLoaded(url)) {
      await this.loadModule(url, { cache: true });
    }
  }

  clearCache(): void {
    this.loadedModules.clear();
  }

  getSupportedFormats(): ModuleFormat[] {
    return [this.format];
  }

  protected getCachedModule<T = any>(url: string): T | undefined {
    return this.loadedModules.get(url);
  }

  protected setCachedModule<T = any>(url: string, module: T): void {
    this.loadedModules.set(url, module);
  }

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeout?: number
  ): Promise<T> {
    if (!timeout) return promise;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new LoadTimeoutError("Operation timed out", timeout)),
        timeout
      );
    });

    return Promise.race([promise, timeoutPromise]);
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    attempts: number = 3,
    delay: number = 1000,
    backoff?: number
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < attempts - 1) {
          const currentDelay = backoff ? delay * Math.pow(backoff, i) : delay;
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
      }
    }

    throw lastError!;
  }
}

/**
 * ESM Module Loader
 */
export class ESMModuleLoader extends BaseModuleLoader {
  protected format: ModuleFormat = "esm";

  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    const cacheKey = url;

    // Check cache
    if (options?.cache !== false) {
      const cached = this.getCachedModule<T>(cacheKey);
      if (cached) return cached;
    }

    try {
      const loadFn = () => this.loadESMModule(url);

      let result: T;
      if (options?.retry) {
        result = await this.withRetry(
          loadFn,
          options.retry.attempts,
          options.retry.delay,
          options.retry.backoff
        );
      } else {
        result = await loadFn();
      }

      if (options?.timeout) {
        result = await this.withTimeout(
          Promise.resolve(result),
          options.timeout
        );
      }

      // Cache the result
      if (options?.cache !== false) {
        this.setCachedModule(cacheKey, result);
      }

      return result;
    } catch (error) {
      if (options?.fallback) {
        return options.fallback();
      }
      throw new NetworkError(url, error as Error);
    }
  }

  private async loadESMModule<T = any>(url: string): Promise<T> {
    // Ensure URL is properly formatted for ESM
    const esmUrl = this.normalizeESMUrl(url);

    // Use dynamic import
    const module = await import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      esmUrl
    );

    // Return the module (check for default export)
    return (module.default || module) as T;
  }

  private normalizeESMUrl(url: string): string {
    // Add .mjs extension if no extension is present
    if (!this.hasExtension(url)) {
      url += ".mjs";
    }

    // Add cache busting parameter
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}_t=${Date.now()}`;
  }

  private hasExtension(url: string): boolean {
    const path = url.split("?")[0]; // Remove query params
    return /\.[^\/]+$/.test(path);
  }
}

/**
 * UMD Module Loader
 */
export class UMDModuleLoader extends BaseModuleLoader {
  protected format: ModuleFormat = "umd";

  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    const cacheKey = url;

    // Check cache
    if (options?.cache !== false) {
      const cached = this.getCachedModule<T>(cacheKey);
      if (cached) return cached;
    }

    try {
      const loadFn = () => this.loadUMDModule(url);

      let result: T;
      if (options?.retry) {
        result = await this.withRetry(
          loadFn,
          options.retry.attempts,
          options.retry.delay,
          options.retry.backoff
        );
      } else {
        result = await loadFn();
      }

      if (options?.timeout) {
        result = await this.withTimeout(
          Promise.resolve(result),
          options.timeout
        );
      }

      // Cache the result
      if (options?.cache !== false) {
        this.setCachedModule(cacheKey, result);
      }

      return result;
    } catch (error) {
      if (options?.fallback) {
        return options.fallback();
      }
      throw new NetworkError(url, error as Error);
    }
  }

  private async loadUMDModule<T = any>(url: string): Promise<T> {
    if (typeof document === "undefined") {
      // Node.js environment - use require or dynamic import
      return this.loadUMDInNode(url);
    } else {
      // Browser environment - use script tag
      return this.loadUMDInBrowser(url);
    }
  }

  private async loadUMDInBrowser<T = any>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;

      // Generate a unique callback name
      const callbackName = `expozr_umd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      script.onload = () => {
        try {
          // Try to extract the module from global scope
          // This is a simplified approach - real implementation would need
          // to detect the global variable name
          const module =
            (window as any)[callbackName] || this.extractGlobalModule();
          resolve(module);
        } catch (error) {
          reject(error);
        } finally {
          document.head.removeChild(script);
        }
      };

      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load UMD module: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  private async loadUMDInNode<T = any>(url: string): Promise<T> {
    // In Node.js, try dynamic import or require
    try {
      const module = await import(/* @vite-ignore */ url);
      return (module.default || module) as T;
    } catch (error) {
      // Fallback to require if available
      if (typeof require !== "undefined") {
        return require(url) as T;
      }
      throw error;
    }
  }

  private extractGlobalModule(): any {
    // This is a simplified extraction - real implementation would need
    // more sophisticated detection of what was added to global scope
    if (typeof window !== "undefined") {
      const keys = Object.keys(window);
      // Return the last added global (very naive approach)
      return (window as any)[keys[keys.length - 1]];
    }
    return null;
  }
}

/**
 * Hybrid Module Loader that tries ESM first, falls back to UMD
 */
export class HybridModuleLoader extends BaseModuleLoader {
  protected format: ModuleFormat = "esm"; // Primary format
  private esmLoader = new ESMModuleLoader();
  private umdLoader = new UMDModuleLoader();

  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    const cacheKey = url;

    // Check cache
    if (options?.cache !== false) {
      const cached = this.getCachedModule<T>(cacheKey);
      if (cached) return cached;
    }

    // Try ESM first
    try {
      const result = await this.esmLoader.loadModule<T>(url, options);

      // Cache the result
      if (options?.cache !== false) {
        this.setCachedModule(cacheKey, result);
      }

      return result;
    } catch (esmError) {
      // Fall back to UMD
      try {
        const umdUrl = this.convertToUMDUrl(url);
        const result = await this.umdLoader.loadModule<T>(umdUrl, options);

        // Cache the result
        if (options?.cache !== false) {
          this.setCachedModule(cacheKey, result);
        }

        return result;
      } catch (umdError) {
        // If both fail, throw the original ESM error
        throw esmError;
      }
    }
  }

  private convertToUMDUrl(esmUrl: string): string {
    // Convert ESM URL to UMD URL
    // This is a simple heuristic - real implementation might need more logic
    return esmUrl
      .replace(/\.mjs$/, ".umd.js")
      .replace(/\.esm\.js$/, ".umd.js")
      .replace(/\.js$/, ".umd.js");
  }

  getSupportedFormats(): ModuleFormat[] {
    return ["esm", "umd"];
  }

  clearCache(): void {
    super.clearCache();
    this.esmLoader.clearCache();
    this.umdLoader.clearCache();
  }
}

/**
 * Default format detector based on URL patterns and environment
 */
export class DefaultFormatDetector implements ModuleFormatDetector {
  async detectFormat(urlOrContent: string): Promise<ModuleFormat | null> {
    // Simple URL-based detection
    if (urlOrContent.includes(".mjs") || urlOrContent.includes(".esm.")) {
      return "esm";
    }

    if (urlOrContent.includes(".umd.") || urlOrContent.includes("umd")) {
      return "umd";
    }

    if (urlOrContent.includes(".cjs") || urlOrContent.includes("commonjs")) {
      return "cjs";
    }

    // Default based on environment
    if (typeof module !== "undefined" && module.exports) {
      return "cjs";
    }

    return "esm"; // Default to ESM in modern environments
  }

  isFormatSupported(format: ModuleFormat): boolean {
    switch (format) {
      case "esm":
        return this.supportsESM();
      case "umd":
        return true; // UMD works everywhere
      case "cjs":
        return typeof require !== "undefined";
      default:
        return false;
    }
  }

  getOptimalFormat(availableFormats: ModuleFormat[]): ModuleFormat {
    // Prefer ESM in modern environments
    if (availableFormats.includes("esm") && this.supportsESM()) {
      return "esm";
    }

    // Fall back to UMD for compatibility
    if (availableFormats.includes("umd")) {
      return "umd";
    }

    // Use CommonJS in Node.js
    if (availableFormats.includes("cjs") && typeof require !== "undefined") {
      return "cjs";
    }

    // Return first available format
    return availableFormats[0] || "esm";
  }

  private supportsESM(): boolean {
    try {
      // Check if environment supports ES modules
      return typeof window !== "undefined"
        ? "noModule" in document.createElement("script")
        : typeof module !== "undefined" && module.exports === undefined;
    } catch {
      return false;
    }
  }
}
