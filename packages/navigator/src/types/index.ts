/**
 * Type definitions for the Navigator package
 */

import type { HostConfig } from "@expozr/core";

// Re-export core types that we extend
export type {
  LoadOptions,
  ModuleLoader,
  CacheManager,
  HostConfig,
  Inventory,
  Cargo,
  LoadedCargo,
  ExpozrReference,
  EventEmitter,
  ExpozrEvents,
  INavigator,
} from "@expozr/core";

/**
 * Configuration for auto-loader functionality
 */
export interface AutoLoaderConfig {
  /** Map of expozr name to configuration */
  expozrs: Record<
    string,
    {
      /** Base URL of the expozr */
      url: string;
      /** Version constraint (optional) */
      version?: string;
      /** Map of module name to cargo name or function names */
      modules: Record<string, string | string[]>;
    }
  >;
  /** Global namespace for exposing functions (default: 'expozr') */
  globalNamespace?: string;
  /** Whether to automatically expose functions globally */
  autoExpose?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
}

/**
 * Loaded module structure
 */
export interface LoadedModule {
  [key: string]: any;
}

/**
 * Auto-loader context with loading state
 */
export interface LoaderContext {
  /** Loaded modules by name */
  modules: Record<string, LoadedModule>;
  /** Extracted functions by name */
  functions: Record<string, Function>;
  /** Current loading status */
  status: "loading" | "ready" | "error";
  /** Error information if status is 'error' */
  error?: Error;
}

/**
 * UMD module loading options
 */
export interface UMDLoadOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Expected global variable name */
  expectedGlobalName?: string;
}

/**
 * Information about a loaded UMD module
 */
export interface UMDModuleInfo {
  /** The loaded module */
  module: any;
  /** Global variable name where module was found */
  globalName: string;
  /** URL that was loaded */
  url: string;
}

/**
 * Navigator factory configuration
 */
export interface NavigatorConfig extends Partial<HostConfig> {
  /** Whether to use enhanced navigator with module system support */
  enhanced?: boolean;
}
