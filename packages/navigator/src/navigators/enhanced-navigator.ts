/**
 * ExpozrNavigator with advanced module system support
 */

import {
  getGlobalModuleSystem,
  DefaultFormatDetector,
  ESMModuleLoader,
  UMDModuleLoader,
  CargoNotFoundError,
  ExpozrNotFoundError,
  generateCargoKey,
  isBrowser,
} from "@expozr/core";
import type {
  ModuleLoader,
  ModuleFormat,
  ModuleLoadingStrategy,
} from "@expozr/core";

import { BaseExpozrNavigator } from "./base-navigator";
import { generateFormatUrls } from "../utils";

import type { LoadedCargo, LoadOptions, NavigatorConfig } from "../types";

// Environment-aware loaders from navigator package
import {
  createModuleLoader,
  createBrowserLoader,
  createNodeLoader,
} from "../loaders";

/**
 * ExpozrNavigator with universal module system support
 * Provides advanced features like format detection, hybrid loading, and module system integration
 */
export class ExpozrNavigator extends BaseExpozrNavigator {
  private moduleSystemConfig: NavigatorConfig["moduleSystem"];
  private environment: "browser" | "node";
  private moduleLoader: ModuleLoader;

  /**
   * Create an ExpozrNavigator instance
   * @param config - Navigator configuration
   */
  constructor(config: NavigatorConfig = {}) {
    super(config);

    // Store module system config for later use
    this.moduleSystemConfig = config.moduleSystem;

    // Detect runtime environment (browser vs node) unless explicitly set
    const envPreference = this.moduleSystemConfig?.environment || "auto";
    if (envPreference === "auto") {
      this.environment = isBrowser() ? "browser" : "node";
    } else {
      this.environment = envPreference === "browser" ? "browser" : "node";
    }

    // Initialize the module system with user configuration
    this.initializeModuleSystem(config.moduleSystem);

    // Create an environment-aware module loader for this navigator
    if (this.moduleSystemConfig?.environment === "browser") {
      this.moduleLoader = createBrowserLoader();
    } else if (this.moduleSystemConfig?.environment === "node") {
      this.moduleLoader = createNodeLoader();
    } else {
      this.moduleLoader = createModuleLoader();
    }
  }

  /**
   * Initialize the global module system with loaders
   */
  private initializeModuleSystem(
    config?: NavigatorConfig["moduleSystem"]
  ): void {
    // Create module system config with user preferences
    const systemConfig = {
      primary: config?.primary || ("esm" as const),
      fallbacks: config?.fallbacks || (["umd", "cjs"] as const),
      strategy: config?.strategy || ("dynamic" as const),
      hybrid: config?.hybrid !== false,
      // Add smart fallback configuration
      automaticModuleDiscovery: config?.automaticModuleDiscovery === true, // Disabled by default
      suppressErrors: config?.suppressErrors !== false, // Suppress errors by default
    };

    const moduleSystem = getGlobalModuleSystem(systemConfig);
    const registry = moduleSystem.getLoaderRegistry();

    // Register module loaders
    registry.registerLoader("esm", new ESMModuleLoader());
    registry.registerLoader("umd", new UMDModuleLoader());

    // Register format detector
    registry.registerDetector(new DefaultFormatDetector());
  }

  /**
   * Load a cargo from a expozr with advanced format detection
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
    // const cacheKey = generateCargoKey(expozr, cargo);

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

      // Use cargo's module system if available, otherwise use options
      const detectedModuleSystem = cargoInfo.moduleSystem;
      const requestedModuleFormat = options?.moduleFormat;

      // Log warning if user overrides detected module system
      if (
        requestedModuleFormat &&
        detectedModuleSystem &&
        requestedModuleFormat !== detectedModuleSystem
      ) {
        console.warn(
          `⚠️  Module system override detected for ${expozr}/${cargo}:\n` +
            `   Detected: ${detectedModuleSystem}\n` +
            `   Requested: ${requestedModuleFormat}\n` +
            `   Using requested format, but this may cause loading issues.`
        );
      }

      // Determine which format to use (requested overrides detected)
      const moduleFormat = requestedModuleFormat || detectedModuleSystem;

      // Check if smart fallback is enabled (global config or per-load option)
      const shouldUseSmartFallback =
        options?.automaticModuleDiscovery === true ||
        (options?.automaticModuleDiscovery !== false &&
          this.moduleSystemConfig?.automaticModuleDiscovery === true);

      let result: { module: T; format: string; strategy: string };

      if (shouldUseSmartFallback) {
        // Use smart fallback - probe multiple URLs
        const cargoUrls = await this.resolveCargoUrls(expozrRef, cargoInfo);
        result = await this.loadModuleWithBestFormat<T>(cargoUrls, {
          ...options,
          moduleFormat,
          expozrName: expozr,
          cargoName: cargoInfo.name,
        });
      } else {
        // Use single URL approach - faster and simpler
        result = await this.loadModuleDirectly<T>(expozrRef, cargoInfo, {
          ...options,
          moduleFormat,
          expozrName: expozr,
          cargoName: cargoInfo.name,
        });
      }

      const loadedCargo: LoadedCargo<T> = {
        module: result.module,
        cargo: cargoInfo,
        expozr: inventory.expozr,
        loadedAt: Date.now(),
        fromCache: false,
        format: result.format as ModuleFormat,
        strategy: result.strategy as ModuleLoadingStrategy,
      };

      // Cache the loaded cargo
      this.setLoadedCargo(expozr, cargo, loadedCargo);

      this.eventEmitter.emit("cargo:loaded", {
        expozr,
        cargo,
        module: result.module,
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
   * Load module directly using the single URL from inventory (no fallback probing)
   * @param expozrRef - Expozr reference configuration
   * @param cargoInfo - Cargo metadata
   * @param options - Loading options
   * @returns Promise resolving to module with format and strategy info
   */
  private async loadModuleDirectly<T = any>(
    expozrRef: any,
    cargoInfo: any,
    options?: LoadOptions
  ): Promise<{
    module: T;
    format: ModuleFormat;
    strategy: ModuleLoadingStrategy;
  }> {
    // Build the direct URL from inventory entry
    const baseUrl = expozrRef.url.endsWith("/")
      ? expozrRef.url
      : `${expozrRef.url}/`;
    const url = `${baseUrl}${cargoInfo.entry}`;

    // Determine format - use provided moduleFormat, then inventory moduleSystem, then detect from entry
    const format =
      options?.moduleFormat ||
      cargoInfo.moduleSystem ||
      this.detectFormatFromEntry(cargoInfo.entry);
    const strategy = (options?.strategy ||
      this.moduleSystemConfig?.strategy ||
      "dynamic") as ModuleLoadingStrategy;

    try {
      let module: T;

      // Use the environment-aware module loader to load the URL
      module = await this.moduleLoader.loadModule<T>(url, {
        ...options,
        exports: cargoInfo.exports,
        expozrName: options?.expozrName,
        cargoName: options?.cargoName,
        // Hint the desired format so loader implementations can prefer it
        // cast to any because core LoadOptions doesn't include navigator-specific hints
      } as any);

      return {
        module,
        format,
        strategy,
      };
    } catch (error) {
      // Check if errors should be suppressed
      const shouldSuppressErrors =
        options?.suppressErrors === true ||
        (options?.suppressErrors !== false &&
          this.moduleSystemConfig?.suppressErrors === true);

      if (shouldSuppressErrors) {
        // Log error to console instead of showing on screen
        console.warn(`Failed to load cargo directly from ${url}:`, error);
      }

      throw error;
    }
  }

  /**
   * Detect module format from entry file extension
   * @param entry - Entry file name
   * @returns Detected module format
   */
  private detectFormatFromEntry(entry: string): ModuleFormat {
    if (entry.endsWith(".mjs")) return "esm";
    if (entry.endsWith(".umd.js")) return "umd";
    if (entry.endsWith(".cjs")) return "cjs";
    if (entry.endsWith(".js")) return "umd"; // Default for .js files
    return "esm"; // Fallback
  }

  /**
   * Load module with the best available format using the module system
   * @param urls - Array of URLs with format information
   * @param options - Loading options
   * @returns Promise resolving to module with format and strategy info
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

    // Reorder URLs based on user preferences
    const orderedUrls = this.orderUrlsByPreference(urls, options);

    // Try each format in order of preference
    let lastError: Error | null = null;

    // Check if error suppression is enabled
    const shouldSuppressErrors =
      options?.suppressErrors === true ||
      (options?.suppressErrors !== false &&
        this.moduleSystemConfig?.suppressErrors === true);

    for (const { format, url } of orderedUrls) {
      try {
        let module: T;

        // Delegate to environment-aware module loader and hint the format
        module = await this.moduleLoader.loadModule<T>(url, {
          ...options,
          expozrName: options?.expozrName,
          cargoName: options?.cargoName,
        } as any);

        return {
          module,
          format,
          strategy: (options?.strategy || "dynamic") as ModuleLoadingStrategy,
        };
      } catch (error) {
        lastError = error as Error;

        if (shouldSuppressErrors) {
          console.warn(`Failed to load ${format} format from ${url}:`, error);
        } else {
          console.error(`Failed to load ${format} format from ${url}:`, error);
        }
      }
    }

    // If all formats failed, try the universal module system
    try {
      const firstUrl = urls[0];
      const module = await moduleSystem.loadModule<T>(firstUrl.url, options);

      return {
        module,
        format: "auto" as ModuleFormat,
        strategy: "fallback" as ModuleLoadingStrategy,
      };
    } catch (error) {
      lastError = error as Error;
    }

    throw lastError || new Error("All module loading strategies failed");
  }

  /**
   * Order URLs by user preference (module format preference)
   * @param urls - Available URLs with formats
   * @param options - Load options with format preferences
   * @returns Reordered URLs
   */
  private orderUrlsByPreference(
    urls: { format: ModuleFormat; url: string }[],
    options?: LoadOptions
  ): { format: ModuleFormat; url: string }[] {
    // If user provided explicit preferences, respect them
    if (options?.moduleFormat || options?.fallbackFormats) {
      const preferred: { format: ModuleFormat; url: string }[] = [];
      const fallbacks: { format: ModuleFormat; url: string }[] = [];
      const others: { format: ModuleFormat; url: string }[] = [];

      // Group URLs by preference
      for (const urlInfo of urls) {
        if (options.moduleFormat === urlInfo.format) {
          preferred.push(urlInfo);
        } else if (options.fallbackFormats?.includes(urlInfo.format as any)) {
          fallbacks.push(urlInfo);
        } else {
          others.push(urlInfo);
        }
      }

      // Order fallbacks by user preference
      if (options.fallbackFormats) {
        fallbacks.sort((a, b) => {
          const aIndex = options.fallbackFormats!.indexOf(a.format as any);
          const bIndex = options.fallbackFormats!.indexOf(b.format as any);
          return aIndex - bIndex;
        });
      }

      return [...preferred, ...fallbacks, ...others];
    }

    // No explicit user preferences: choose sensible defaults based on environment
    const env = this.environment;
    const defaultOrder =
      env === "browser" ? ["esm", "umd", "cjs"] : ["cjs", "esm", "umd"];

    const ordered = [...urls].sort((a, b) => {
      const aIndex = defaultOrder.indexOf(a.format as string);
      const bIndex = defaultOrder.indexOf(b.format as string);
      const ai = aIndex === -1 ? 99 : aIndex;
      const bi = bIndex === -1 ? 99 : bIndex;
      return ai - bi;
    });

    return ordered;
  }

  /**
   * Get the detected runtime environment for this navigator instance
   */
  getEnvironment(): "browser" | "node" {
    return this.environment;
  }

  /**
   * Resolve cargo URLs for different formats
   * @param expozrRef - Expozr reference configuration
   * @param cargoInfo - Cargo metadata
   * @returns Promise resolving to array of format-specific URLs
   */
  private async resolveCargoUrls(
    expozrRef: any,
    cargoInfo: any
  ): Promise<{ format: ModuleFormat; url: string }[]> {
    const baseUrl = expozrRef.url;
    const entry = cargoInfo.entry;

    // Generate format-specific URLs
    const urls = generateFormatUrls(baseUrl, entry);

    // Convert string format to ModuleFormat and filter
    const validUrls = urls
      .filter(({ format }) => ["esm", "umd", "cjs", "auto"].includes(format))
      .map(({ format, url }) => ({
        format: format as ModuleFormat,
        url,
      }));

    // Sort by preference (ESM first, then UMD, then others)
    return validUrls.sort((a, b) => {
      const order: Record<string, number> = { esm: 0, umd: 1, cjs: 2, auto: 3 };
      return (
        (order[a.format as string] || 99) - (order[b.format as string] || 99)
      );
    });
  }

  /**
   * Check if URL exists (simplified implementation)
   * @param url - URL to check
   * @returns Promise resolving to true if URL exists
   */
  private async urlExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the global module system instance
   * @returns Module system instance
   */
  getModuleSystem() {
    return getGlobalModuleSystem();
  }

  /**
   * Get enhanced cache statistics
   * @returns Detailed cache information
   */
  getCacheStats() {
    return {
      navigator: {
        inventories: this.inventoryCache.size,
        loadedCargo: this.loadedCargo.size,
      },
      moduleSystem: {
        available: true,
      },
    };
  }
}
