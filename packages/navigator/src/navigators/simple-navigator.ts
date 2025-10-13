/**
 * Simple Navigator implementation with basic module loading
 */

import type { LoadedCargo, LoadOptions } from "../types";
import {
  CargoNotFoundError,
  ExpozrNotFoundError,
  generateCargoKey,
} from "@expozr/core";
import { BaseNavigator } from "./base-navigator";
import { UniversalModuleLoader } from "../loaders";

/**
 * Simple Navigator - Basic runtime loader for Expozr
 * Provides straightforward module loading without advanced features
 */
export class SimpleNavigator extends BaseNavigator {
  private moduleLoader: UniversalModuleLoader;

  /**
   * Create a simple navigator instance
   * @param config - Navigator configuration
   */
  constructor(config: any = {}) {
    super(config);
    this.moduleLoader = new UniversalModuleLoader();
  }

  /**
   * Load a cargo from a expozr
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

      // Load the module
      const moduleUrl = this.resolveCargoUrl(expozrRef, cargoInfo);
      const loadedModule = await this.moduleLoader.loadModule<T>(
        moduleUrl,
        options
      );

      const loadedCargo: LoadedCargo<T> = {
        module: loadedModule,
        cargo: cargoInfo,
        expozr: inventory.expozr,
        loadedAt: Date.now(),
        fromCache: false,
        format: "auto" as any, // Simple navigator doesn't track format
        strategy: "simple" as any, // Simple loading strategy
      };

      // Cache the loaded cargo
      this.setLoadedCargo(expozr, cargo, loadedCargo);

      this.eventEmitter.emit("cargo:loaded", {
        expozr,
        cargo,
        module: loadedModule,
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
   * Clear module loader cache in addition to base reset
   */
  async reset(): Promise<void> {
    await super.reset();
    this.moduleLoader.clearCache();
  }

  /**
   * Get the module loader instance
   * @returns Universal module loader
   */
  getModuleLoader(): UniversalModuleLoader {
    return this.moduleLoader;
  }

  /**
   * Get cache statistics
   * @returns Object with cache information
   */
  getCacheStats() {
    return {
      navigator: {
        inventories: this.inventoryCache.size,
        loadedCargo: this.loadedCargo.size,
      },
      moduleLoader: this.moduleLoader.getCacheStats(),
    };
  }
}
