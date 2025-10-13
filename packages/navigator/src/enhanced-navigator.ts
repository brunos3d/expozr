/**
 * Enhanced Navigator with universal module system support
 */

import type {
  INavigator,
  CacheManager,
  HostConfig,
  LoadOptions,
  LoadedCargo,
  Inventory,
  Cargo,
  ExpozrReference,
  EventEmitter,
  ExpozrEvents,
  ModuleFormat,
  ModuleLoadingStrategy,
} from "@expozr/core";

import {
  getGlobalModuleSystem,
  ESMModuleLoader,
  UMDModuleLoader,
  HybridModuleLoader,
  DefaultFormatDetector,
  ExpozrNotFoundError,
  CargoNotFoundError,
  NetworkError,
  ValidationUtils,
  ObjectUtils,
  generateCargoKey,
  joinUrl,
  defaultHostConfig,
  deepMerge,
} from "@expozr/core";

import { createCache } from "./cache";

/**
 * Simple event emitter implementation
 */
class SimpleEventEmitter implements EventEmitter {
  private listeners = new Map<keyof ExpozrEvents, Array<(data: any) => void>>();

  on<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof ExpozrEvents>(event: K, data: ExpozrEvents[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }
}

/**
 * Enhanced Navigator with universal module system support
 */
export class Navigator implements INavigator {
  private config: HostConfig;
  private cache: CacheManager;
  private inventoryCache = new Map<string, Inventory>();
  private loadedCargo = new Map<string, LoadedCargo>();
  private eventEmitter: EventEmitter;

  constructor(config: Partial<HostConfig> = {}) {
    this.config = deepMerge(defaultHostConfig, config) as HostConfig;
    this.cache = createCache(
      this.config.cache?.strategy || "memory",
      this.config.cache
    );
    this.eventEmitter = new SimpleEventEmitter();

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

    // Register hybrid loader as the default
    const hybridLoader = new HybridModuleLoader();
    registry.registerLoader("esm", hybridLoader); // Override ESM with hybrid

    // Register format detector
    registry.registerDetector(new DefaultFormatDetector());
  }

  /**
   * Load a cargo from a expozr
   */
  async loadCargo<T = any>(
    expozr: string,
    cargo: string,
    options?: LoadOptions
  ): Promise<LoadedCargo<T>> {
    const cacheKey = generateCargoKey(expozr, cargo);

    // Check if already loaded
    if (this.loadedCargo.has(cacheKey)) {
      const loaded = this.loadedCargo.get(cacheKey)!;
      return loaded as LoadedCargo<T>;
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

      // Resolve cargo URLs for different formats
      const cargoUrls = await this.resolveCargoUrls(expozrRef, cargoInfo);

      // Load the module using the universal module system
      const {
        module: loadedModule,
        format,
        strategy,
      } = await this.loadModuleWithBestFormat(cargoUrls, options);

      const loadedCargo: LoadedCargo<T> = {
        module: loadedModule,
        cargo: cargoInfo,
        expozr: inventory.expozr,
        loadedAt: Date.now(),
        fromCache: false,
        format,
        strategy,
      };

      // Cache the loaded cargo
      this.loadedCargo.set(cacheKey, loadedCargo);

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
   * Load module with the best available format
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
        const loader = moduleSystem.getLoaderRegistry().getLoader(format);
        if (loader) {
          const module = await loader.loadModule<T>(url, options);
          return {
            module,
            format,
            strategy: "dynamic", // Could be enhanced to detect actual strategy
          };
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load ${format} format from ${url}:`, error);
      }
    }

    // If all formats failed, try the universal module system
    try {
      const module = await moduleSystem.loadModule<T>(urls[0].url, options);
      return {
        module,
        format: urls[0].format,
        strategy: "dynamic",
      };
    } catch (error) {
      throw lastError || error;
    }
  }

  /**
   * Resolve cargo URLs for different formats
   */
  private async resolveCargoUrls(
    expozrRef: ExpozrReference,
    cargoInfo: Cargo
  ): Promise<{ format: ModuleFormat; url: string }[]> {
    const baseUrl = expozrRef.url.endsWith("/")
      ? expozrRef.url
      : `${expozrRef.url}/`;

    // Try to detect available formats from the entry point
    const entry = cargoInfo.entry;
    const urls: { format: ModuleFormat; url: string }[] = [];

    // Check for different format variants
    const formatVariants: { format: ModuleFormat; patterns: string[] }[] = [
      { format: "esm", patterns: [".mjs", ".esm.js", ".module.js"] },
      { format: "umd", patterns: [".umd.js", ".js"] },
      { format: "cjs", patterns: [".cjs", ".common.js"] },
    ];

    for (const { format, patterns } of formatVariants) {
      for (const pattern of patterns) {
        // Try different naming patterns
        const potentialUrls = [
          `${baseUrl}${entry.replace(/\.[^.]+$/, pattern)}`,
          `${baseUrl}${entry}${pattern}`,
          `${baseUrl}${entry}`,
        ];

        for (const url of potentialUrls) {
          if (await this.urlExists(url)) {
            urls.push({ format, url });
            break; // Found one variant for this format
          }
        }
      }
    }

    // If no specific formats found, use the original entry
    if (urls.length === 0) {
      const originalUrl = `${baseUrl}${entry}`;
      const detector = new DefaultFormatDetector();
      const detectedFormat = await detector.detectFormat(originalUrl);
      urls.push({
        format: detectedFormat || "esm",
        url: originalUrl,
      });
    }

    // Sort by preference (ESM first, then UMD, then others)
    return urls.sort((a, b) => {
      const preference = { esm: 0, umd: 1, cjs: 2, amd: 3, iife: 4, system: 5 };
      return (preference[a.format] || 99) - (preference[b.format] || 99);
    });
  }

  /**
   * Check if URL exists (simplified implementation)
   */
  private async urlExists(url: string): Promise<boolean> {
    try {
      if (typeof fetch !== "undefined") {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
      } else {
        // In Node.js, assume URL exists for now
        // Real implementation would use HTTP head request
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get inventory from a expozr
   */
  async getInventory(expozr: string): Promise<Inventory> {
    // Check cache first
    if (this.inventoryCache.has(expozr)) {
      return this.inventoryCache.get(expozr)!;
    }

    const expozrRef = this.config.expozrs[expozr];
    if (!expozrRef) {
      throw new ExpozrNotFoundError(expozr);
    }

    try {
      // Load inventory manifest
      const inventoryUrl = joinUrl(expozrRef.url, "expozr.inventory.json");
      const response = await fetch(inventoryUrl);

      if (!response.ok) {
        throw new NetworkError(
          inventoryUrl,
          new Error(`HTTP ${response.status}`)
        );
      }

      const inventory: Inventory = await response.json();

      // Validate inventory
      ValidationUtils.validateInventory(inventory);

      // Cache the inventory
      this.inventoryCache.set(expozr, inventory);

      this.eventEmitter.emit("expozr:loaded", { expozr, inventory });

      return inventory;
    } catch (error) {
      throw new NetworkError(expozrRef.url, error as Error);
    }
  }

  /**
   * Preload cargo from expozrs
   */
  async preload(expozr: string, cargo?: string[]): Promise<void> {
    const inventory = await this.getInventory(expozr);
    const cargoNames = cargo || Object.keys(inventory.cargo);

    const preloadPromises = cargoNames.map(async (cargoName) => {
      try {
        await this.loadCargo(expozr, cargoName, { cache: true });
      } catch (error) {
        console.warn(
          `Failed to preload cargo ${cargoName} from ${expozr}:`,
          error
        );
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Get the cache manager
   */
  getCache(): CacheManager {
    return this.cache;
  }

  /**
   * Get loaded expozrs
   */
  getLoadedExpozrs(): string[] {
    return Array.from(this.inventoryCache.keys());
  }

  /**
   * Get loaded cargo
   */
  getLoadedCargo(): Record<string, LoadedCargo> {
    const result: Record<string, LoadedCargo> = {};
    for (const [key, cargo] of this.loadedCargo.entries()) {
      result[key] = cargo;
    }
    return result;
  }

  /**
   * Clear all caches and loaded modules
   */
  async reset(): Promise<void> {
    this.inventoryCache.clear();
    this.loadedCargo.clear();
    await this.cache.clear();

    // Clear module loader caches
    const moduleSystem = getGlobalModuleSystem();
    const loaders = moduleSystem.getLoaderRegistry().getAvailableLoaders();
    for (const loader of loaders.values()) {
      if (loader.clearCache) {
        loader.clearCache();
      }
    }

    this.eventEmitter.emit("navigator:reset", {});
  }

  /**
   * Get the event emitter for listening to navigator events
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HostConfig>): void {
    this.config = deepMerge(this.config, config) as HostConfig;
  }
}

/**
 * Create a new Navigator instance
 */
export function createNavigator(config?: Partial<HostConfig>): Navigator {
  return new Navigator(config);
}

// Export the legacy Navigator for backward compatibility
export { Navigator as ExpozrNavigator };
