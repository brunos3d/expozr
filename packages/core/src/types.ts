/**
 * Core types for the Expozr ecosystem
 */

/**
 * A Cargo represents an individual module being exposed by a Warehouse
 */
export interface Cargo {
  /** Unique name identifier for the cargo */
  name: string;
  /** Semantic version of the cargo */
  version: string;
  /** Entry point file path or URL */
  entry: string;
  /** Specific exports from the module (optional, defaults to default export) */
  exports?: string[];
  /** Runtime dependencies required by this cargo */
  dependencies?: Record<string, string>;
  /** Additional metadata */
  metadata?: CargoMetadata;
}

/**
 * Metadata for a Cargo
 */
export interface CargoMetadata {
  description?: string;
  author?: string;
  license?: string;
  tags?: string[];
  /** File size in bytes */
  size?: number;
  /** Last modified timestamp */
  lastModified?: number;
}

/**
 * Inventory represents the complete manifest of all Cargo exposed by a Warehouse
 */
export interface Inventory {
  /** Information about the warehouse itself */
  warehouse: WarehouseInfo;
  /** Map of cargo name to cargo definition */
  cargo: Record<string, Cargo>;
  /** Global dependencies shared across all cargo */
  dependencies?: Record<string, string>;
  /** Timestamp when inventory was generated */
  timestamp: number;
  /** Integrity checksum for verification */
  checksum?: string;
}

/**
 * Information about a Warehouse
 */
export interface WarehouseInfo {
  /** Unique name of the warehouse */
  name: string;
  /** Semantic version of the warehouse */
  version: string;
  /** Base URL where the warehouse is hosted */
  url: string;
  /** Human readable description */
  description?: string;
  /** Warehouse maintainer */
  author?: string;
}

/**
 * Catalog represents a registry of available Warehouses
 */
export interface Catalog {
  /** Map of warehouse name to warehouse information */
  warehouses: Record<string, CatalogWarehouseEntry>;
  /** Last time the catalog was updated */
  lastUpdated: number;
  /** Catalog version for compatibility */
  version: string;
}

/**
 * Warehouse entry in a catalog
 */
export interface CatalogWarehouseEntry {
  /** Base URL of the warehouse */
  url: string;
  /** Warehouse name */
  name: string;
  /** Current version */
  version: string;
  /** Short description */
  description?: string;
  /** URL to the inventory manifest */
  inventoryUrl: string;
  /** Available versions */
  versions?: string[];
  /** Warehouse tags for discovery */
  tags?: string[];
}

/**
 * Configuration for a Warehouse (used at build time)
 */
export interface WarehouseConfig {
  /** Name of the warehouse */
  name: string;
  /** Version of the warehouse */
  version: string;
  /** Map of cargo name to cargo configuration */
  expose: Record<string, string | CargoConfig>;
  /** Global dependencies for the warehouse */
  dependencies?: Record<string, string>;
  /** Warehouse metadata */
  metadata?: WarehouseMetadata;
  /** Build configuration */
  build?: WarehouseBuildConfig;
}

/**
 * Configuration for individual Cargo in a Warehouse
 */
export interface CargoConfig {
  /** Entry point file path */
  entry: string;
  /** Specific exports to expose */
  exports?: string[];
  /** Cargo-specific dependencies */
  dependencies?: Record<string, string>;
  /** Cargo metadata */
  metadata?: CargoMetadata;
}

/**
 * Metadata for a Warehouse
 */
export interface WarehouseMetadata {
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  tags?: string[];
}

/**
 * Build configuration for a Warehouse
 */
export interface WarehouseBuildConfig {
  /** Output directory for built assets */
  outDir?: string;
  /** Public path for assets */
  publicPath?: string;
  /** Whether to generate source maps */
  sourcemap?: boolean;
  /** Minification settings */
  minify?: boolean;
  /** Target environment */
  target?: 'browser' | 'node' | 'universal';
}

/**
 * Configuration for a Host application
 */
export interface HostConfig {
  /** Map of warehouse references */
  warehouses: Record<string, WarehouseReference>;
  /** Catalog configuration for warehouse discovery */
  catalog?: string | CatalogConfig;
  /** Caching configuration */
  cache?: CacheConfig;
  /** Loading configuration */
  loading?: LoadingConfig;
}

/**
 * Reference to a warehouse from a host
 */
export interface WarehouseReference {
  /** URL where the warehouse is hosted */
  url: string;
  /** Version constraint (semver) */
  version?: string;
  /** Local alias for the warehouse */
  alias?: string;
  /** Fallback URL in case primary fails */
  fallback?: string;
}

/**
 * Catalog configuration
 */
export interface CatalogConfig {
  /** URL of the catalog */
  url: string;
  /** How often to refresh the catalog (in ms) */
  refreshInterval?: number;
  /** Whether to cache the catalog */
  cache?: boolean;
}

/**
 * Caching configuration
 */
export interface CacheConfig {
  /** Cache strategy */
  strategy: 'memory' | 'localStorage' | 'indexedDB' | 'none';
  /** Time to live in milliseconds */
  ttl?: number;
  /** Maximum cache size */
  maxSize?: number;
  /** Whether to persist cache across sessions */
  persist?: boolean;
}

/**
 * Loading configuration
 */
export interface LoadingConfig {
  /** Timeout for loading operations (in ms) */
  timeout?: number;
  /** Retry configuration */
  retry?: RetryConfig;
  /** Preloading strategy */
  preload?: PreloadConfig;
}

/**
 * Retry configuration for failed loads
 */
export interface RetryConfig {
  /** Number of retry attempts */
  attempts: number;
  /** Delay between retries (in ms) */
  delay: number;
  /** Exponential backoff multiplier */
  backoff?: number;
}

/**
 * Preloading configuration
 */
export interface PreloadConfig {
  /** Whether to preload all cargo from warehouses */
  enabled: boolean;
  /** Which cargo to preload (if not all) */
  include?: string[];
  /** Which cargo to exclude from preloading */
  exclude?: string[];
}

/**
 * Options for loading a specific cargo
 */
export interface LoadOptions {
  /** Override default timeout */
  timeout?: number;
  /** Override default retry config */
  retry?: RetryConfig;
  /** Whether to use cache */
  cache?: boolean;
  /** Fallback module if loading fails */
  fallback?: () => Promise<any>;
}

/**
 * Runtime information about a loaded cargo
 */
export interface LoadedCargo<T = any> {
  /** The loaded module */
  module: T;
  /** Cargo metadata */
  cargo: Cargo;
  /** Warehouse it came from */
  warehouse: WarehouseInfo;
  /** When it was loaded */
  loadedAt: number;
  /** Whether it was loaded from cache */
  fromCache: boolean;
}