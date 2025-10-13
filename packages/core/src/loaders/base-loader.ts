/**
 * Base module loader implementation
 */

import type { ModuleLoader, ModuleFormat, LoadOptions } from "../types";

/**
 * Abstract base class for module loaders providing common functionality
 */
export abstract class BaseModuleLoader implements ModuleLoader {
  protected loadedModules = new Map<string, any>();
  protected abstract format: ModuleFormat;

  /**
   * Load a module from the given URL
   */
  abstract loadModule<T = any>(url: string, options?: LoadOptions): Promise<T>;

  /**
   * Check if a module is already loaded and cached
   */
  isModuleLoaded(url: string): boolean {
    return this.loadedModules.has(url);
  }

  /**
   * Preload a module without executing it (default implementation)
   */
  async preloadModule(url: string): Promise<void> {
    if (!this.isModuleLoaded(url)) {
      await this.loadModule(url);
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
   */
  getSupportedFormats(): ModuleFormat[] {
    return [this.format];
  }

  /**
   * Get a cached module if available
   */
  protected getCachedModule<T = any>(url: string): T | undefined {
    return this.loadedModules.get(url);
  }

  /**
   * Cache a loaded module
   */
  protected setCachedModule<T = any>(url: string, module: T): void {
    this.loadedModules.set(url, module);
  }

  /**
   * Execute a promise with timeout
   */
  protected async withTimeout<T>(
    promise: Promise<T>,
    timeout?: number
  ): Promise<T> {
    if (!timeout) return promise;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Retry a function with exponential backoff
   */
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
          await this.sleep(currentDelay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Sleep for the specified number of milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalize URL for consistent caching
   */
  protected normalizeUrl(url: string): string {
    try {
      return new URL(url).href;
    } catch {
      return url;
    }
  }

  /**
   * Check if URL has a file extension
   */
  protected hasExtension(url: string): boolean {
    const path = url.split("?")[0]; // Remove query params
    return /\.[^\/]+$/.test(path);
  }

  /**
   * Add cache busting parameter to URL
   */
  protected addCacheBusting(url: string): string {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}_t=${Date.now()}`;
  }
}
