/**
 * Enhanced Navigator with advanced module system support
 */

import type { LoadedCargo, LoadOptions } from "../types";

import type { ModuleFormat, ModuleLoadingStrategy } from "@expozr/core";

import {
  getGlobalModuleSystem,
  ESMModuleLoader,
  UMDModuleLoader,
  HybridModuleLoader,
  DefaultFormatDetector,
  CargoNotFoundError,
  ExpozrNotFoundError,
  generateCargoKey,
} from "@expozr/core";

import { BaseNavigator } from "./base-navigator";
import { generateFormatUrls } from "../utils";

/**
 * Enhanced Navigator with universal module system support
 * Provides advanced features like format detection, hybrid loading, and module system integration
 */
export class EnhancedNavigator extends BaseNavigator {
  /**
   * Create an enhanced navigator instance
   * @param config - Navigator configuration
   */
  constructor(config: any = {}) {
    super(config);

    // Initialize the module system
    this.initializeModuleSystem();
  }

  /**
   * Initialize the global module system with loaders
   */
  private initializeModuleSystem(): void {
    const moduleSystem = getGlobalModuleSystem();
    const registry = moduleSystem.getLoaderRegistry();

    // Register module loaders
    registry.registerLoader("esm", new ESMModuleLoader());
    registry.registerLoader("umd", new UMDModuleLoader());

    // Register format detector
    registry.registerDetector(new DefaultFormatDetector());
  }

  /**
   * Load a cargo from a expozr with advanced format detection
   * @param expozr - Expozr name
   * @param cargo - Cargo name
   * @param options - Loading options
   * @returns Promise resolving to loaded cargo
   */
  async loadCargo<T = any>(
    expozr: string,
    cargo: string,
    options?: LoadOptions
  ): Promise<LoadedCargo<T>> {
    const cacheKey = generateCargoKey(expozr, cargo);

    // Check if already loaded
    if (this.isCargoLoaded(expozr, cargo)) {
      const loaded = this.getLoadedCargoByName<T>(expozr, cargo)!;
      return loaded;
    }

    this.eventEmitter.emit("cargo:loading", { expozr, cargo });

    try {
      // Get expozr info
      const expozrRef = this.config.expozrs[expozr];
      if (!expozrRef) {
        throw new ExpozrNotFoundError(expozr);
      }

      // Get inventory
      const inventory = await this.getInventory(expozr);

      // Find cargo
      const cargoInfo = inventory.cargo[cargo];
      if (!cargoInfo) {
        throw new CargoNotFoundError(cargo, expozr);
      }

      // Resolve potential URLs for different formats
      const cargoUrls = await this.resolveCargoUrls(expozrRef, cargoInfo);

      // Load module with the best available format
      const result = await this.loadModuleWithBestFormat<T>(cargoUrls, options);

      const loadedCargo: LoadedCargo<T> = {
        module: result.module,
        cargo: cargoInfo,
        expozr: inventory.expozr,
        loadedAt: Date.now(),
        fromCache: false,
        format: result.format,
        strategy: result.strategy,
      };

      // Cache the loaded cargo
      this.setLoadedCargo(expozr, cargo, loadedCargo);

      this.eventEmitter.emit("cargo:loaded", {
        expozr,
        cargo,
        module: result.module,
      });

      return loadedCargo;
    } catch (error) {
      this.eventEmitter.emit("cargo:error", {
        expozr,
        cargo,
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Load module with the best available format using the module system
   * @param urls - Array of URLs with format information
   * @param options - Loading options
   * @returns Promise resolving to module with format and strategy info
   */
  private async loadModuleWithBestFormat<T = any>(
    urls: { format: ModuleFormat; url: string }[],
    options?: LoadOptions
  ): Promise<{
    module: T;
    format: ModuleFormat;
    strategy: ModuleLoadingStrategy;
  }> {
    const moduleSystem = getGlobalModuleSystem();

    // Try each format in order of preference
    let lastError: Error | null = null;

    for (const { format, url } of urls) {
      try {
        const module = await moduleSystem.loadModule<T>(url, options);

        return {
          module,
          format,
          strategy: "enhanced" as ModuleLoadingStrategy,
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load ${format} format from ${url}:`, error);
      }
    }

    // If all formats failed, try the universal module system
    try {
      const firstUrl = urls[0];
      const module = await moduleSystem.loadModule<T>(firstUrl.url, options);

      return {
        module,
        format: "auto" as ModuleFormat,
        strategy: "fallback" as ModuleLoadingStrategy,
      };
    } catch (error) {
      lastError = error as Error;
    }

    throw lastError || new Error("All module loading strategies failed");
  }

  /**
   * Resolve cargo URLs for different formats
   * @param expozrRef - Expozr reference configuration
   * @param cargoInfo - Cargo metadata
   * @returns Promise resolving to array of format-specific URLs
   */
  private async resolveCargoUrls(
    expozrRef: any,
    cargoInfo: any
  ): Promise<{ format: ModuleFormat; url: string }[]> {
    const baseUrl = expozrRef.url;
    const entry = cargoInfo.entry;

    // Generate format-specific URLs
    const urls = generateFormatUrls(baseUrl, entry);

    // Convert string format to ModuleFormat and filter
    const validUrls = urls
      .filter(({ format }) => ["esm", "umd", "cjs", "auto"].includes(format))
      .map(({ format, url }) => ({
        format: format as ModuleFormat,
        url,
      }));

    // Sort by preference (ESM first, then UMD, then others)
    return validUrls.sort((a, b) => {
      const order: Record<string, number> = { esm: 0, umd: 1, cjs: 2, auto: 3 };
      return (
        (order[a.format as string] || 99) - (order[b.format as string] || 99)
      );
    });
  }

  /**
   * Check if URL exists (simplified implementation)
   * @param url - URL to check
   * @returns Promise resolving to true if URL exists
   */
  private async urlExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the global module system instance
   * @returns Module system instance
   */
  getModuleSystem() {
    return getGlobalModuleSystem();
  }

  /**
   * Get enhanced cache statistics
   * @returns Detailed cache information
   */
  getCacheStats() {
    return {
      navigator: {
        inventories: this.inventoryCache.size,
        loadedCargo: this.loadedCargo.size,
      },
      moduleSystem: {
        available: true,
      },
    };
  }
}
