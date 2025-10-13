/**
 * Core types for the Expozr ecosystem
 */

/**
 * Supported module formats
 */
export type ModuleFormat = "esm" | "umd" | "cjs" | "amd" | "iife" | "system";

/**
 * Module loading strategy
 */
export type ModuleLoadingStrategy = "dynamic" | "static" | "lazy" | "eager";

/**
 * Module system configuration
 */
export interface ModuleSystemConfig {
  /** Primary format to use */
  primary: ModuleFormat;
  /** Fallback formats in order of preference */
  fallbacks?: ModuleFormat[];
  /** Strategy for loading modules */
  strategy?: ModuleLoadingStrategy;
  /** Enable hybrid mode (both ESM and UMD) */
  hybrid?: boolean;
  /** Module resolution configuration */
  resolution?: ModuleResolutionConfig;
  /** External dependencies handling */
  externals?: ExternalConfig;
  /** Polyfills and compatibility */
  compatibility?: CompatibilityConfig;
}

/**
 * Module resolution configuration
 */
export interface ModuleResolutionConfig {
  /** Module file extensions to resolve */
  extensions?: string[];
  /** Module alias mapping */
  alias?: Record<string, string>;
  /** Base URL for module resolution */
  baseUrl?: string;
  /** Paths mapping for module resolution */
  paths?: Record<string, string[]>;
}

/**
 * External dependencies configuration
 */
export interface ExternalConfig {
  /** Dependencies to treat as external */
  externals?: string[] | Record<string, string | ExternalDependencyConfig>;
  /** Strategy for external dependencies */
  strategy?: "cdn" | "global" | "import" | "mixed";
  /** CDN base URL for external dependencies */
  cdnUrl?: string;
}

/**
 * External dependency configuration
 */
export interface ExternalDependencyConfig {
  /** Global variable name */
  global?: string;
  /** CommonJS module name */
  commonjs?: string;
  /** CommonJS2 module name */
  commonjs2?: string;
  /** AMD module name */
  amd?: string;
  /** ESM module specifier */
  esm?: string;
  /** CDN URL */
  cdn?: string;
}

/**
 * Compatibility configuration
 */
export interface CompatibilityConfig {
  /** Target ECMAScript version */
  target?:
    | "es5"
    | "es6"
    | "es2015"
    | "es2017"
    | "es2018"
    | "es2019"
    | "es2020"
    | "es2021"
    | "es2022"
    | "esnext";
  /** Browser compatibility targets */
  browsers?: string[];
  /** Enable legacy browser support */
  legacy?: boolean;
  /** Polyfills to include */
  polyfills?: string[];
}

/**
 * A Cargo represents an individual module being exposed by a Expozr
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
 * Inventory represents the complete manifest of all Cargo exposed by a Expozr
 */
export interface Inventory {
  /** Information about the expozr itself */
  expozr: ExpozrInfo;
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
 * Information about a Expozr
 */
export interface ExpozrInfo {
  /** Unique name of the expozr */
  name: string;
  /** Semantic version of the expozr */
  version: string;
  /** Base URL where the expozr is hosted */
  url: string;
  /** Human readable description */
  description?: string;
  /** Expozr maintainer */
  author?: string;
}

/**
 * Catalog represents a registry of available Expozrs
 */
export interface Catalog {
  /** Map of expozr name to expozr information */
  expozrs: Record<string, CatalogExpozrEntry>;
  /** Last time the catalog was updated */
  lastUpdated: number;
  /** Catalog version for compatibility */
  version: string;
}

/**
 * Expozr entry in a catalog
 */
export interface CatalogExpozrEntry {
  /** Base URL of the expozr */
  url: string;
  /** Expozr name */
  name: string;
  /** Current version */
  version: string;
  /** Short description */
  description?: string;
  /** URL to the inventory manifest */
  inventoryUrl: string;
  /** Available versions */
  versions?: string[];
  /** Expozr tags for discovery */
  tags?: string[];
}

/**
 * Configuration for a Expozr (used at build time)
 */
export interface ExpozrConfig {
  /** Name of the expozr */
  name: string;
  /** Version of the expozr */
  version: string;
  /** Map of cargo name to cargo configuration */
  expose: Record<string, string | CargoConfig>;
  /** Global dependencies for the expozr */
  dependencies?: Record<string, string>;
  /** Expozr metadata */
  metadata?: ExpozrMetadata;
  /** Build configuration */
  build?: ExpozrBuildConfig;
}

/**
 * Configuration for individual Cargo in a Expozr
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
 * Metadata for a Expozr
 */
export interface ExpozrMetadata {
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  tags?: string[];
}

/**
 * Build configuration for a Expozr
 */
export interface ExpozrBuildConfig {
  /** Output directory for built assets */
  outDir?: string;
  /** Public path for assets */
  publicPath?: string;
  /** Whether to generate source maps */
  sourcemap?: boolean;
  /** Minification settings */
  minify?: boolean;
  /** Target environment */
  target?: "browser" | "node" | "universal";
  /** Module output format */
  format?: ModuleFormat | ModuleFormat[];
  /** Module system configuration */
  moduleSystem?: ModuleSystemConfig;
}

/**
 * Configuration for a Host application
 */
export interface HostConfig {
  /** Map of expozr references */
  expozrs: Record<string, ExpozrReference>;
  /** Catalog configuration for expozr discovery */
  catalog?: string | CatalogConfig;
  /** Caching configuration */
  cache?: CacheConfig;
  /** Loading configuration */
  loading?: LoadingConfig;
}

/**
 * Reference to a expozr from a host
 */
export interface ExpozrReference {
  /** URL where the expozr is hosted */
  url: string;
  /** Version constraint (semver) */
  version?: string;
  /** Local alias for the expozr */
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
  strategy: "memory" | "localStorage" | "indexedDB" | "none";
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
  /** Whether to preload all cargo from expozrs */
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
  /** Specific exports to extract from the module */
  exports?: string[];
  /** Whether to add cache busting parameters */
  cacheBusting?: boolean;
}

/**
 * Runtime information about a loaded cargo
 */
export interface LoadedCargo<T = any> {
  /** The loaded module */
  module: T;
  /** Cargo metadata */
  cargo: Cargo;
  /** Expozr it came from */
  expozr: ExpozrInfo;
  /** When it was loaded */
  loadedAt: number;
  /** Whether it was loaded from cache */
  fromCache: boolean;
  /** Format used to load the module */
  format: ModuleFormat;
  /** Loading strategy used */
  strategy: ModuleLoadingStrategy;
}

/**
 * Module loader interface
 */
export interface ModuleLoader {
  /** Load a module from a URL */
  loadModule<T = any>(url: string, options?: LoadOptions): Promise<T>;
  /** Check if a module is already loaded */
  isModuleLoaded(url: string): boolean;
  /** Preload a module without executing */
  preloadModule?(url: string): Promise<void>;
  /** Clear module cache */
  clearCache?(): void;
  /** Get supported formats */
  getSupportedFormats(): ModuleFormat[];
}

/**
 * Bundler adapter interface
 */
export interface BundlerAdapter {
  /** Name of the bundler */
  name: string;
  /** Configure bundler for expozr build */
  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any;
  /** Configure bundler for host application */
  configureHost(config: HostConfig, bundlerConfig: any): any;
  /** Get default configuration for this bundler */
  getDefaultConfig(): any;
  /** Check if bundler is available */
  isAvailable(): boolean;
}

/**
 * Module format detector interface
 */
export interface ModuleFormatDetector {
  /** Detect format from URL or content */
  detectFormat(urlOrContent: string): Promise<ModuleFormat | null>;
  /** Check if format is supported in current environment */
  isFormatSupported(format: ModuleFormat): boolean;
  /** Get optimal format for current environment */
  getOptimalFormat(availableFormats: ModuleFormat[]): ModuleFormat;
}
