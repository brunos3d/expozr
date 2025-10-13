/**
 * Base navigator functionality shared between implementations
 */

import type {
  HostConfig,
  CacheManager,
  EventEmitter,
  Inventory,
  Cargo,
  LoadedCargo,
  ExpozrReference,
  INavigator,
  LoadOptions,
  ExpozrEvents,
} from "../types";

import {
  ValidationUtils,
  generateCargoKey,
  defaultHostConfig,
  deepMerge,
} from "@expozr/core";

import { createCache } from "../cache";
import { SimpleEventEmitter } from "../utils";
import { getInventoryUrl, getModuleUrl } from "../utils";

/**
 * Base navigator class with common functionality
 * Provides shared implementation for inventory management, caching, and events
 */
export abstract class BaseNavigator implements INavigator {
  protected config: HostConfig;
  protected cache: CacheManager;
  protected inventoryCache = new Map<string, Inventory>();
  protected loadedCargo = new Map<string, LoadedCargo>();
  protected eventEmitter: EventEmitter;

  /**
   * Create a base navigator instance
   * @param config - Navigator configuration
   */
  constructor(config: Partial<HostConfig> = {}) {
    this.config = deepMerge(defaultHostConfig, config) as HostConfig;
    this.cache = createCache(
      this.config.cache?.strategy || "memory",
      this.config.cache
    );
    this.eventEmitter = new SimpleEventEmitter();
  }

  /**
   * Abstract method to load a cargo - must be implemented by subclasses
   */
  abstract loadCargo<T = any>(
    expozr: string,
    cargo: string,
    options?: LoadOptions
  ): Promise<LoadedCargo<T>>;

  /**
   * Get inventory from a expozr with caching
   * @param expozr - Expozr name
   * @returns Promise resolving to the inventory
   */
  async getInventory(expozr: string): Promise<Inventory> {
    // Check cache first
    if (this.inventoryCache.has(expozr)) {
      return this.inventoryCache.get(expozr)!;
    }

    const expozrRef = this.config.expozrs[expozr];
    if (!expozrRef) {
      throw new Error(`Expozr "${expozr}" not found in configuration`);
    }

    try {
      const inventoryUrl = getInventoryUrl(expozrRef.url);
      const inventoryData = await this.fetchInventory(inventoryUrl);

      if (!ValidationUtils.validateInventory(inventoryData)) {
        throw new Error(`Invalid inventory from expozr: ${expozr}`);
      }

      // Cache the inventory
      this.inventoryCache.set(expozr, inventoryData);
      // Note: Not emitting event here as this is inventory loading, not cargo loading

      return inventoryData;
    } catch (error) {
      // Note: Using generic error event since there's no specific inventory error event
      throw error;
    }
  }

  /**
   * Preload cargo from expozrs
   * @param expozr - Expozr name
   * @param cargo - Optional list of cargo names to preload
   */
  async preload(expozr: string, cargo?: string[]): Promise<void> {
    const inventory = await this.getInventory(expozr);
    const cargoToPreload = cargo || Object.keys(inventory.cargo);

    // Note: Using available events from ExpozrEvents interface

    try {
      await Promise.all(
        cargoToPreload.map(async (cargoName) => {
          try {
            await this.loadCargo(expozr, cargoName);
          } catch (error) {
            console.warn(`Failed to preload cargo ${cargoName}:`, error);
          }
        })
      );

      // Preload completed successfully
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the cache manager
   * @returns Cache manager instance
   */
  getCache(): CacheManager {
    return this.cache;
  }

  /**
   * Get loaded expozrs
   * @returns Array of expozr names that have been loaded
   */
  getLoadedExpozrs(): string[] {
    return Array.from(this.inventoryCache.keys());
  }

  /**
   * Get loaded cargo
   * @returns Object mapping cargo keys to loaded cargo
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

    this.eventEmitter.emit("navigator:reset", {});
  }

  /**
   * Update configuration
   * @param config - Partial configuration to merge
   */
  updateConfig(config: Partial<HostConfig>): void {
    this.config = deepMerge(this.config, config) as HostConfig;
  }

  /**
   * Get the event emitter for listening to navigator events
   * @returns Event emitter instance
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Add event listener
   * @param event - Event name
   * @param listener - Event listener function
   */
  on<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param listener - Event listener function
   */
  off<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Fetch inventory from URL with caching
   * @param url - Inventory URL
   * @returns Promise resolving to inventory data
   */
  protected async fetchInventory(url: string): Promise<Inventory> {
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
   * @param expozrRef - Expozr reference configuration
   * @param cargo - Cargo metadata
   * @returns Full URL to the cargo module
   */
  protected resolveCargoUrl(expozrRef: ExpozrReference, cargo: Cargo): string {
    return getModuleUrl(expozrRef.url, cargo.entry);
  }

  /**
   * Check if cargo is already loaded
   * @param expozr - Expozr name
   * @param cargo - Cargo name
   * @returns True if cargo is loaded
   */
  protected isCargoLoaded(expozr: string, cargo: string): boolean {
    const cacheKey = generateCargoKey(expozr, cargo);
    return this.loadedCargo.has(cacheKey);
  }

  /**
   * Get loaded cargo if available
   * @param expozr - Expozr name
   * @param cargo - Cargo name
   * @returns Loaded cargo or undefined
   */
  protected getLoadedCargoByName<T = any>(
    expozr: string,
    cargo: string
  ): LoadedCargo<T> | undefined {
    const cacheKey = generateCargoKey(expozr, cargo);
    return this.loadedCargo.get(cacheKey) as LoadedCargo<T> | undefined;
  }

  /**
   * Store loaded cargo in cache
   * @param expozr - Expozr name
   * @param cargo - Cargo name
   * @param loadedCargo - Loaded cargo data
   */
  protected setLoadedCargo(
    expozr: string,
    cargo: string,
    loadedCargo: LoadedCargo
  ): void {
    const cacheKey = generateCargoKey(expozr, cargo);
    this.loadedCargo.set(cacheKey, loadedCargo);
  }
}
