/**
 * Universal module loader that detects environment and delegates
 */

import type { ModuleLoader, LoadOptions, ModuleFormat } from "@expozr/core";
import { BrowserModuleLoader } from "./browser-loader";
import { NodeModuleLoader } from "./node-loader";

/**
 * Universal module loader that detects environment and uses appropriate loader
 * Automatically switches between browser and Node.js loaders based on environment
 */
export class UniversalModuleLoader implements ModuleLoader {
  private loader: ModuleLoader;

  /**
   * Create a universal loader that auto-detects the environment
   */
  constructor() {
    // Auto-detect environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      this.loader = new BrowserModuleLoader();
    } else {
      this.loader = new NodeModuleLoader();
    }
  }

  /**
   * Load a module using the appropriate environment-specific loader
   * @param url - URL of the module to load
   * @param options - Loading options
   * @returns Promise resolving to the loaded module
   */
  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    return this.loader.loadModule(url, options);
  }

  /**
   * Check if a module is already loaded
   * @param url - Module URL
   * @returns True if module is loaded
   */
  isModuleLoaded(url: string): boolean {
    return this.loader.isModuleLoaded(url);
  }

  /**
   * Preload a module for faster access later
   * @param url - Module URL to preload
   */
  async preloadModule(url: string): Promise<void> {
    return this.loader?.preloadModule?.(url);
  }

  /**
   * Clear the module cache
   */
  clearCache(): void {
    this.loader?.clearCache?.();
  }

  /**
   * Get supported module formats
   * @returns Array of supported formats
   */
  getSupportedFormats(): ModuleFormat[] {
    return this.loader.getSupportedFormats();
  }

  /**
   * Get the underlying loader instance
   * @returns The environment-specific loader
   */
  getUnderlyingLoader(): ModuleLoader {
    return this.loader;
  }

  /**
   * Get the environment type
   * @returns 'browser' or 'node'
   */
  getEnvironment(): "browser" | "node" {
    return this.loader instanceof BrowserModuleLoader ? "browser" : "node";
  }

  /**
   * Get cache statistics from the underlying loader
   * @returns Cache statistics if available
   */
  getCacheStats() {
    if ("getCacheStats" in this.loader) {
      return (this.loader as any).getCacheStats();
    }
    return { size: 0, keys: [] };
  }

  /**
   * Check if universal loading is supported in current environment
   * @returns True if either browser or Node.js loading is supported
   */
  static isSupported(): boolean {
    return BrowserModuleLoader.isSupported() || NodeModuleLoader.isSupported();
  }
}
