/**
 * Type definitions for the Navigator package
 */

import type { HostConfig } from "@expozr/core";

// Re-export core types that we extend
export type {
  ModuleLoader,
  CacheManager,
  HostConfig,
  Inventory,
  Cargo,
  LoadedCargo,
  ExpozrReference,
  EventEmitter,
  ExpozrEvents,
  IExpozrNavigator,
} from "@expozr/core";

// Import LoadOptions from core to extend it
import type { LoadOptions as CoreLoadOptions } from "@expozr/core";

/**
 * Enhanced load options with module system preferences
 */
export interface LoadOptions extends CoreLoadOptions {
  /** Module format preference for this specific load */
  moduleFormat?: "esm" | "umd" | "cjs";
  /** Fallback formats if preferred format fails */
  fallbackFormats?: ("esm" | "umd" | "cjs")[];
  /** Loading strategy override for this load */
  strategy?: "dynamic" | "static" | "lazy" | "eager";
  /** Enable smart fallback for this specific load (overrides global config) */
  automaticModuleDiscovery?: boolean;
  /** Suppress errors for this specific load (overrides global config) */
  suppressErrors?: boolean;
}

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
  /** Module system configuration for loading modules */
  moduleSystem?: {
    /** Primary module format to prefer */
    primary?: "esm" | "umd" | "cjs";
    /** Fallback formats if primary fails */
    fallbacks?: ("esm" | "umd" | "cjs")[];
    /** Loading strategy */
    strategy?: "dynamic" | "static" | "lazy" | "eager";
    /** Whether to enable hybrid loading */
    hybrid?: boolean;
    /** Enable smart fallback system (probe multiple URLs) */
    automaticModuleDiscovery?: boolean;
    /** Suppress webpack/loading errors from showing on screen */
    suppressErrors?: boolean;
  };
}
