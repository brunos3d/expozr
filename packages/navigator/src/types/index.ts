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
 * Enhanced load options with module system preferences and advanced loading controls.
 *
 * This interface extends the core LoadOptions with navigator-specific features like
 * module format detection, fallback strategies, and error handling preferences.
 * These options can override global navigator configuration on a per-load basis.
 *
 * @example
 * ```typescript
 * // Load with specific module format preference
 * await navigator.loadCargo('myExpozr', 'myComponent', {
 *   moduleFormat: 'esm',
 *   fallbackFormats: ['umd', 'cjs'],
 *   automaticModuleDiscovery: true
 * });
 * ```
 */
export interface LoadOptions extends CoreLoadOptions {
  /**
   * Module format preference for this specific load operation.
   *
   * Specifies which module format should be attempted first when loading the cargo.
   * If the specified format fails and fallbackFormats are provided, those will be
   * attempted in order. If automaticModuleDiscovery is enabled, the navigator will
   * probe multiple format URLs automatically.
   *
   * - `"esm"`: ES6 modules (import/export syntax)
   * - `"umd"`: Universal Module Definition (works in browser and Node.js)
   * - `"cjs"`: CommonJS modules (require/module.exports)
   *
   * @default undefined (uses inventory moduleSystem or auto-detection)
   */
  moduleFormat?: "esm" | "umd" | "cjs";

  /**
   * Fallback formats to attempt if the preferred format fails.
   *
   * When the primary moduleFormat fails to load, these formats will be attempted
   * in the specified order. Only used when automaticModuleDiscovery is enabled
   * or when the navigator falls back to multi-format loading.
   *
   * @example ['umd', 'cjs'] - Try UMD first, then CommonJS if UMD fails
   * @default undefined (no specific fallback order)
   */
  fallbackFormats?: ("esm" | "umd" | "cjs")[];

  /**
   * Loading strategy override for this specific load operation.
   *
   * Controls how the module loading process behaves:
   * - `"dynamic"`: Load when needed, with runtime format detection
   * - `"static"`: Load immediately with predefined format
   * - `"lazy"`: Defer loading until first access
   * - `"eager"`: Load immediately and cache aggressively
   *
   * @default "dynamic"
   */
  strategy?: "dynamic" | "static" | "lazy" | "eager";

  /**
   * Enable smart fallback for this specific load (overrides global config).
   *
   * When enabled, the navigator will probe multiple format URLs to find the
   * best available format. This provides maximum compatibility but may be
   * slower due to additional network requests. When disabled, uses direct
   * loading based on inventory information for better performance.
   *
   * Per-load setting takes precedence over global navigator configuration.
   *
   * @default false (disabled for performance, uses direct loading)
   */
  automaticModuleDiscovery?: boolean;

  /**
   * Suppress errors for this specific load (overrides global config).
   *
   * When enabled, loading errors are logged to console instead of being thrown
   * or displayed to the user. Useful for graceful degradation when optional
   * modules fail to load. The load operation will still fail, but error
   * presentation is suppressed.
   *
   * Per-load setting takes precedence over global navigator configuration.
   *
   * @default false (errors are thrown normally)
   */
  suppressErrors?: boolean;
}

/**
 * Configuration for auto-loader functionality.
 *
 * The auto-loader provides a simplified way to configure and load multiple
 * expozrs and their cargo without manual navigation calls. It automatically
 * manages module loading, caching, and global function exposure.
 *
 * @example
 * ```typescript
 * const autoLoader = new AutoLoader({
 *   expozrs: {
 *     'ui-components': {
 *       url: 'https://cdn.example.com/ui-components',
 *       modules: {
 *         'Button': 'Button',
 *         'Modal': ['Modal', 'ModalProps']
 *       }
 *     }
 *   },
 *   globalNamespace: 'myApp',
 *   autoExpose: true
 * });
 * ```
 */
export interface AutoLoaderConfig {
  /**
   * Map of expozr name to configuration.
   *
   * Each key represents an expozr identifier, and the value contains
   * the configuration for how to load and expose that expozr's modules.
   * The expozr name is used as a reference throughout the application.
   */
  expozrs: Record<
    string,
    {
      /**
       * Base URL of the expozr.
       *
       * The root URL where the expozr is hosted. Should include protocol
       * (http:// or https://) and may include a path. The auto-loader will
       * append inventory and module paths to this base URL.
       *
       * @example 'https://cdn.example.com/my-components'
       * @example 'http://localhost:3001'
       */
      url: string;

      /**
       * Version constraint (optional).
       *
       * Specifies which version of the expozr to load. Can be a specific
       * version, semver range, or tag. If not specified, loads the latest
       * available version.
       *
       * @example '1.2.3' - Specific version
       * @example '^1.0.0' - Compatible with 1.x.x
       * @example 'latest' - Latest available version
       */
      version?: string;

      /**
       * Map of module name to cargo name or function names.
       *
       * Defines which cargo to load from the expozr and how to expose them.
       * - Key: Local name for the module in your application
       * - Value: Either a string (cargo name) or array of strings (specific exports)
       *
       * When value is a string, loads the entire cargo under that name.
       * When value is an array, loads specific named exports from the cargo.
       *
       * @example
       * ```typescript
       * modules: {
       *   'Button': 'Button',                // Load entire Button cargo
       *   'Utils': ['debounce', 'throttle'], // Load specific exports
       *   'Modal': 'ModalComponent'          // Load cargo with different name
       * }
       * ```
       */
      modules: Record<string, string | string[]>;
    }
  >;

  /**
   * Global namespace for exposing functions (default: 'expozr').
   *
   * When autoExpose is enabled, loaded functions will be attached to
   * window[globalNamespace]. This provides a global access point for
   * all auto-loaded modules.
   *
   * @default 'expozr'
   */
  globalNamespace?: string;

  /**
   * Whether to automatically expose functions globally.
   *
   * When enabled, loaded modules and functions are automatically attached
   * to the global namespace (window[globalNamespace]). This allows access
   * to loaded modules from anywhere in the application without imports.
   *
   * @default false
   */
  autoExpose?: boolean;

  /**
   * Request timeout in milliseconds.
   *
   * Maximum time to wait for module loading requests before timing out.
   * Applies to both inventory fetching and module loading operations.
   *
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of retry attempts.
   *
   * How many times to retry failed loading operations before giving up.
   * Applies to both network requests and module loading failures.
   *
   * @default 3
   */
  retries?: number;
}

/**
 * Loaded module structure.
 *
 * Represents a dynamically loaded module with its exports and metadata.
 * This is a flexible structure that can contain any number of exported
 * functions, classes, or values from a loaded cargo.
 *
 * The structure mirrors the actual exports of the loaded module, allowing
 * type-safe access to the module's functionality.
 *
 * @example
 * ```typescript
 * const loadedModule: LoadedModule = {
 *   Button: ButtonComponent,
 *   Modal: ModalComponent,
 *   utils: { debounce, throttle },
 *   version: '1.2.3'
 * };
 * ```
 */
export interface LoadedModule {
  /** Any exported value from the loaded module */
  [key: string]: any;
}

/**
 * Auto-loader context with loading state and cached modules.
 *
 * Maintains the runtime state of the auto-loader, including loaded modules,
 * extracted functions, and current loading status. This context is used
 * internally by the auto-loader to track what has been loaded and provide
 * status information to the application.
 *
 * @example
 * ```typescript
 * const context: LoaderContext = {
 *   modules: {
 *     'Button': { default: ButtonComponent, ButtonProps: {} },
 *     'Utils': { debounce: debounceFunc, throttle: throttleFunc }
 *   },
 *   functions: {
 *     'Button': ButtonComponent,
 *     'debounce': debounceFunc,
 *     'throttle': throttleFunc
 *   },
 *   status: 'ready'
 * };
 * ```
 */
export interface LoaderContext {
  /**
   * Loaded modules by name.
   *
   * Contains all successfully loaded modules, indexed by their local names
   * as defined in the AutoLoaderConfig. Each module contains its original
   * exports structure as loaded from the expozr.
   */
  modules: Record<string, LoadedModule>;

  /**
   * Extracted functions by name.
   *
   * Contains individual functions extracted from loaded modules for easy
   * access. When autoExpose is enabled, these functions are also available
   * on the global namespace. This provides a flattened view of all available
   * functions across all loaded modules.
   */
  functions: Record<string, Function>;

  /**
   * Current loading status.
   *
   * - `"loading"`: Auto-loader is currently loading one or more modules
   * - `"ready"`: All configured modules have been loaded successfully
   * - `"error"`: One or more modules failed to load
   */
  status: "loading" | "ready" | "error";

  /**
   * Error information if status is 'error'.
   *
   * Contains the last error that occurred during module loading.
   * This can be a network error, module parsing error, or any other
   * loading-related failure. Only present when status is 'error'.
   */
  error?: Error;
}

/**
 * UMD module loading options.
 *
 * Configuration options specific to Universal Module Definition (UMD) module loading.
 * UMD modules are loaded by injecting a script tag and extracting the module from
 * the global scope. These options control the loading behavior and error handling.
 *
 * @example
 * ```typescript
 * const options: UMDLoadOptions = {
 *   timeout: 10000,
 *   retries: 2,
 *   expectedGlobalName: 'MyLibrary'
 * };
 * ```
 */
export interface UMDLoadOptions {
  /**
   * Request timeout in milliseconds.
   *
   * Maximum time to wait for the UMD script to load and execute before
   * timing out. This includes both the network request time and script
   * execution time.
   *
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of retry attempts.
   *
   * How many times to retry loading the UMD script if it fails. Failures
   * can include network errors, script errors, or timeout conditions.
   *
   * @default 3
   */
  retries?: number;

  /**
   * Expected global variable name.
   *
   * The name of the global variable that the UMD module should create.
   * If specified, the loader will check for this specific global name
   * after script execution. If not specified, the loader will attempt
   * to detect new globals automatically.
   *
   * @example 'React' - Module exposes itself as window.React
   * @example 'MyLibrary' - Module exposes itself as window.MyLibrary
   */
  expectedGlobalName?: string;
}

/**
 * Information about a loaded UMD module.
 *
 * Contains metadata about a successfully loaded UMD module, including
 * the actual module content, where it was found in the global scope,
 * and the URL it was loaded from. This information is useful for
 * debugging and tracking module loading.
 *
 * @example
 * ```typescript
 * const moduleInfo: UMDModuleInfo = {
 *   module: { Button: ButtonComponent, Modal: ModalComponent },
 *   globalName: 'UIComponents',
 *   url: 'https://cdn.example.com/ui-components.umd.js'
 * };
 * ```
 */
export interface UMDModuleInfo {
  /**
   * The loaded module.
   *
   * Contains the actual module content as extracted from the global scope.
   * This is typically an object containing the module's exports, but can
   * be any value depending on how the UMD module exposes itself.
   */
  module: any;

  /**
   * Global variable name where module was found.
   *
   * The name of the global variable (property of window) where the module
   * was found after script execution. This may be different from the
   * expectedGlobalName if the module uses a different naming convention.
   *
   * @example 'React' - Found as window.React
   * @example 'MyLibrary' - Found as window.MyLibrary
   */
  globalName: string;

  /**
   * URL that was loaded.
   *
   * The complete URL that was used to load the UMD script. Useful for
   * debugging and logging purposes.
   *
   * @example 'https://cdn.example.com/library@1.2.3/dist/library.umd.js'
   */
  url: string;
}

/**
 * Navigator factory configuration.
 *
 * Comprehensive configuration for the ExpozrNavigator, extending the core HostConfig
 * with navigator-specific options for module system handling, loading strategies,
 * and error management. This configuration defines the global behavior of the
 * navigator, which can be overridden on a per-load basis.
 *
 * @example
 * ```typescript
 * const navigator = new ExpozrNavigator({
 *   expozrs: {
 *     'ui-components': { url: 'https://cdn.example.com/ui' }
 *   },
 *   moduleSystem: {
 *     primary: 'esm',
 *     fallbacks: ['umd', 'cjs'],
 *     automaticModuleDiscovery: true,
 *     suppressErrors: false
 *   }
 * });
 * ```
 */
export interface NavigatorConfig extends Partial<HostConfig> {
  /**
   * Module system configuration for loading modules.
   *
   * Defines the global preferences for how modules should be loaded,
   * including format preferences, loading strategies, and error handling.
   * These settings serve as defaults but can be overridden on individual
   * load operations through LoadOptions.
   */
  moduleSystem?: {
    /**
     * Primary module format to prefer.
     *
     * The module format that should be attempted first when loading any cargo.
     * This serves as the default preference for all load operations unless
     * overridden by LoadOptions.moduleFormat or inventory moduleSystem.
     *
     * - `"esm"`: ES6 modules (modern standard, best performance)
     * - `"umd"`: Universal Module Definition (universal compatibility)
     * - `"cjs"`: CommonJS modules (Node.js standard)
     *
     * @default "esm"
     */
    primary?: "esm" | "umd" | "cjs";

    /**
     * Fallback formats if primary fails.
     *
     * Array of module formats to try if the primary format fails to load.
     * Only used when automaticModuleDiscovery is enabled. The formats are
     * attempted in the order specified.
     *
     * @example ['umd', 'cjs'] - Try UMD first, then CommonJS
     * @default ['umd', 'cjs']
     */
    fallbacks?: ("esm" | "umd" | "cjs")[];

    /**
     * Loading strategy.
     *
     * Defines how modules should be loaded and cached:
     * - `"dynamic"`: Load when needed with runtime format detection
     * - `"static"`: Load immediately with predefined format
     * - `"lazy"`: Defer loading until first access (React.lazy style)
     * - `"eager"`: Load immediately and cache aggressively
     *
     * @default "dynamic"
     */
    strategy?: "dynamic" | "static" | "lazy" | "eager";

    /**
     * Whether to enable hybrid loading.
     *
     * When enabled, the navigator can use multiple loading strategies
     * simultaneously and choose the best result. This provides maximum
     * compatibility but may use more resources.
     *
     * @default true
     */
    hybrid?: boolean;

    /**
     * Enable smart fallback system (probe multiple URLs).
     *
     * When enabled, the navigator will probe multiple format URLs to find
     * the best available format for each cargo. This provides maximum
     * compatibility at the cost of additional network requests.
     *
     * When disabled, the navigator uses direct loading based on inventory
     * information, which is faster but less flexible.
     *
     * Individual load operations can override this setting via LoadOptions.
     *
     * @default false (disabled for performance)
     */
    automaticModuleDiscovery?: boolean;

    /**
     * Suppress webpack/loading errors from showing on screen.
     *
     * When enabled, loading errors are logged to console instead of being
     * thrown or displayed to users. This is useful for graceful degradation
     * when optional modules fail to load, but should be used carefully as
     * it can hide important errors.
     *
     * Individual load operations can override this setting via LoadOptions.
     *
     * @default false (errors are thrown normally)
     */
    suppressErrors?: boolean;
  };
}
