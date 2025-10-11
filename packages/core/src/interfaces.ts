/**
 * Abstract interfaces that must be implemented by adapters
 */

import type {
  ExpozrConfig,
  HostConfig,
  Inventory,
  Cargo,
  LoadOptions,
  LoadedCargo,
} from "./types";

/**
 * Abstract base class for bundler adapters
 */
export abstract class ExpozrAdapter {
  /**
   * Create a expozr plugin for the specific bundler
   */
  abstract createExpozrPlugin(config: ExpozrConfig): any;

  /**
   * Create a host plugin for the specific bundler
   */
  abstract createHostPlugin(config: HostConfig): any;

  /**
   * Generate an inventory manifest from expozr configuration
   */
  abstract generateInventory(config: ExpozrConfig): Promise<Inventory>;

  /**
   * Get the bundler name this adapter supports
   */
  abstract get bundlerName(): string;

  /**
   * Get the version of the bundler this adapter supports
   */
  abstract get supportedVersions(): string[];
}

/**
 * Interface for cache implementations
 */
export interface CacheManager {
  /**
   * Get an item from cache
   */
  get<T = any>(key: string): Promise<T | null>;

  /**
   * Set an item in cache
   */
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Check if an item exists in cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Remove an item from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Get cache size
   */
  size(): Promise<number>;
}

/**
 * Interface for dependency resolvers
 */
export interface DependencyResolver {
  /**
   * Resolve dependencies for a cargo
   */
  resolveDependencies(cargo: Cargo): Promise<Record<string, string>>;

  /**
   * Check if dependencies are satisfied
   */
  checkDependencies(cargo: Cargo): Promise<boolean>;

  /**
   * Get missing dependencies
   */
  getMissingDependencies(cargo: Cargo): Promise<string[]>;
}

/**
 * Interface for expozr discovery
 */
export interface ExpozrDiscovery {
  /**
   * Discover expozrs from a catalog
   */
  discoverExpozrs(catalogUrl: string): Promise<string[]>;

  /**
   * Get expozr information
   */
  getExpozrInfo(expozrUrl: string): Promise<Inventory>;

  /**
   * Check if a expozr is available
   */
  isExpozrAvailable(expozrUrl: string): Promise<boolean>;
}

/**
 * Interface for the main Navigator (runtime loader)
 */
export interface INavigator {
  /**
   * Load a cargo from a expozr
   */
  loadCargo<T = any>(
    expozr: string,
    cargo: string,
    options?: LoadOptions
  ): Promise<LoadedCargo<T>>;

  /**
   * Get inventory from a expozr
   */
  getInventory(expozr: string): Promise<Inventory>;

  /**
   * Preload cargo from expozrs
   */
  preload(expozr: string, cargo?: string[]): Promise<void>;

  /**
   * Get the cache manager
   */
  getCache(): CacheManager;

  /**
   * Get loaded expozrs
   */
  getLoadedExpozrs(): string[];

  /**
   * Get loaded cargo
   */
  getLoadedCargo(): Record<string, LoadedCargo>;

  /**
   * Clear all caches and loaded modules
   */
  reset(): Promise<void>;
}

/**
 * Interface for configuration helpers
 */
export interface ConfigManager {
  /**
   * Load configuration from file
   */
  loadConfig<T = any>(configPath: string): Promise<T>;

  /**
   * Validate configuration
   */
  validateConfig<T = any>(config: T, schema: any): Promise<boolean>;

  /**
   * Merge configurations
   */
  mergeConfigs<T = any>(...configs: Partial<T>[]): T;
}

/**
 * Event types for the Expozr ecosystem
 */
export interface ExpozrEvents {
  "expozr:loaded": { expozr: string; inventory: Inventory };
  "cargo:loading": { expozr: string; cargo: string };
  "cargo:loaded": { expozr: string; cargo: string; module: any };
  "cargo:error": { expozr: string; cargo: string; error: Error };
  "cache:hit": { key: string };
  "cache:miss": { key: string };
  "navigator:reset": {};
}

/**
 * Interface for event emitter
 */
export interface EventEmitter {
  on<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void;
  off<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void;
  emit<K extends keyof ExpozrEvents>(event: K, data: ExpozrEvents[K]): void;
}
