/**
 * Main Navigator class - the runtime loader for the Expozr ecosystem
 */

import type {
  INavigator,
  CacheManager,
  ModuleLoader,
  HostConfig,
  LoadOptions,
  LoadedCargo,
  Inventory,
  Cargo,
  ExpozrReference,
  EventEmitter,
  ExpozrEvents,
} from "@expozr/core";

import {
  ExpozrNotFoundError,
  CargoNotFoundError,
  NetworkError,
  ValidationUtils,
  generateCargoKey,
  joinUrl,
  defaultHostConfig,
  deepMerge,
} from "@expozr/core";

import { createCache } from "./cache";
import { UniversalModuleLoader } from "./loader";

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
 * Navigator - Universal runtime loader for Expozr
 */
export class Navigator implements INavigator {
  private config: HostConfig;
  private cache: CacheManager;
  private moduleLoader: ModuleLoader;
  private inventoryCache = new Map<string, Inventory>();
  private loadedCargo = new Map<string, LoadedCargo>();
  private eventEmitter: EventEmitter;

  constructor(config: Partial<HostConfig> = {}) {
    this.config = deepMerge(defaultHostConfig, config) as HostConfig;
    this.cache = createCache(
      this.config.cache?.strategy || "memory",
      this.config.cache
    );
    this.moduleLoader = new UniversalModuleLoader();
    this.eventEmitter = new SimpleEventEmitter();
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
      const inventoryUrl = joinUrl(expozrRef.url, "expozr.inventory.json");
      const inventoryData = await this.fetchInventory(inventoryUrl);

      if (!ValidationUtils.validateInventory(inventoryData)) {
        throw new Error("Invalid inventory format");
      }

      // Cache the inventory
      this.inventoryCache.set(expozr, inventoryData);

      this.eventEmitter.emit("expozr:loaded", {
        expozr,
        inventory: inventoryData,
      });

      return inventoryData;
    } catch (error) {
      throw new NetworkError(expozrRef.url, error as Error);
    }
  }

  /**
   * Preload cargo from expozrs
   */
  async preload(expozr: string, cargo?: string[]): Promise<void> {
    const inventory = await this.getInventory(expozr);
    const expozrRef = this.config.expozrs[expozr];

    const cargoToPreload = cargo || Object.keys(inventory.cargo);

    await Promise.all(
      cargoToPreload.map(async (cargoName) => {
        const cargoInfo = inventory.cargo[cargoName];
        if (cargoInfo) {
          const moduleUrl = this.resolveCargoUrl(expozrRef, cargoInfo);
          await this.moduleLoader.preloadModule(moduleUrl);
        }
      })
    );
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
    this.moduleLoader.clearCache();
    await this.cache.clear();

    this.eventEmitter.emit("navigator:reset", {});
  }

  /**
   * Add event listener
   */
  on<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Fetch inventory from URL
   */
  private async fetchInventory(url: string): Promise<Inventory> {
    // Check cache first
    const cacheKey = `inventory:${url}`;
    const cached = await this.cache.get<Inventory>(cacheKey);

    if (cached) {
      this.eventEmitter.emit("cache:hit", { key: cacheKey });
      return cached;
    }

    this.eventEmitter.emit("cache:miss", { key: cacheKey });

    // Fetch from network
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const inventory = await response.json();

    // Cache with TTL
    const ttl = this.config.cache?.ttl || 3600000; // 1 hour default
    await this.cache.set(cacheKey, inventory, ttl);

    return inventory;
  }

  /**
   * Resolve the full URL for a cargo module
   */
  private resolveCargoUrl(expozrRef: ExpozrReference, cargo: Cargo): string {
    return joinUrl(expozrRef.url, cargo.entry);
  }
}
