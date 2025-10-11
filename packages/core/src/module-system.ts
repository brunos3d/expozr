/**
 * Abstract module system interfaces and utilities
 */

import type {
  ModuleFormat,
  ModuleLoadingStrategy,
  ModuleSystemConfig,
  ModuleLoader,
  BundlerAdapter,
  ModuleFormatDetector,
  LoadOptions,
} from "./types";

/**
 * Registry for module loaders
 */
export class ModuleLoaderRegistry {
  private loaders = new Map<ModuleFormat, ModuleLoader>();
  private detectors: ModuleFormatDetector[] = [];

  /**
   * Register a module loader for a specific format
   */
  registerLoader(format: ModuleFormat, loader: ModuleLoader): void {
    this.loaders.set(format, loader);
  }

  /**
   * Register a format detector
   */
  registerDetector(detector: ModuleFormatDetector): void {
    this.detectors.push(detector);
  }

  /**
   * Get loader for a specific format
   */
  getLoader(format: ModuleFormat): ModuleLoader | undefined {
    return this.loaders.get(format);
  }

  /**
   * Get all available loaders
   */
  getAvailableLoaders(): Map<ModuleFormat, ModuleLoader> {
    return new Map(this.loaders);
  }

  /**
   * Detect format and get appropriate loader
   */
  async getLoaderForUrl(
    url: string
  ): Promise<{ format: ModuleFormat; loader: ModuleLoader } | null> {
    for (const detector of this.detectors) {
      const format = await detector.detectFormat(url);
      if (format) {
        const loader = this.getLoader(format);
        if (loader) {
          return { format, loader };
        }
      }
    }
    return null;
  }

  /**
   * Get optimal loader based on environment and available formats
   */
  getOptimalLoader(
    availableFormats: ModuleFormat[]
  ): { format: ModuleFormat; loader: ModuleLoader } | null {
    for (const detector of this.detectors) {
      const optimalFormat = detector.getOptimalFormat(availableFormats);
      const loader = this.getLoader(optimalFormat);
      if (loader) {
        return { format: optimalFormat, loader };
      }
    }
    return null;
  }
}

/**
 * Registry for bundler adapters
 */
export class BundlerAdapterRegistry {
  private adapters = new Map<string, BundlerAdapter>();

  /**
   * Register a bundler adapter
   */
  registerAdapter(adapter: BundlerAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): BundlerAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all available adapters
   */
  getAvailableAdapters(): Map<string, BundlerAdapter> {
    return new Map(this.adapters);
  }

  /**
   * Get adapters that are available in current environment
   */
  getActiveAdapters(): BundlerAdapter[] {
    return Array.from(this.adapters.values()).filter((adapter) =>
      adapter.isAvailable()
    );
  }
}

/**
 * Universal module system that works with any bundler
 */
export class UniversalModuleSystem {
  private loaderRegistry = new ModuleLoaderRegistry();
  private bundlerRegistry = new BundlerAdapterRegistry();
  private config: ModuleSystemConfig;

  constructor(config: ModuleSystemConfig) {
    this.config = config;
  }

  /**
   * Load a module using the best available strategy
   */
  async loadModule<T = any>(url: string, options?: LoadOptions): Promise<T> {
    const { format, loader } = await this.selectLoader(url, options);

    if (!loader) {
      throw new Error(`No suitable loader found for: ${url}`);
    }

    return loader.loadModule<T>(url, options);
  }

  /**
   * Select the best loader for a URL
   */
  private async selectLoader(
    url: string,
    options?: LoadOptions
  ): Promise<{ format: ModuleFormat; loader: ModuleLoader }> {
    // Try to detect format from URL
    const detected = await this.loaderRegistry.getLoaderForUrl(url);
    if (detected) {
      return detected;
    }

    // Fall back to primary format
    const primaryLoader = this.loaderRegistry.getLoader(this.config.primary);
    if (primaryLoader) {
      return { format: this.config.primary, loader: primaryLoader };
    }

    // Try fallback formats
    if (this.config.fallbacks) {
      for (const fallbackFormat of this.config.fallbacks) {
        const fallbackLoader = this.loaderRegistry.getLoader(fallbackFormat);
        if (fallbackLoader) {
          return { format: fallbackFormat, loader: fallbackLoader };
        }
      }
    }

    throw new Error(
      `No suitable loader found for format: ${this.config.primary}`
    );
  }

  /**
   * Configure a bundler for expozr build
   */
  configureBundler(bundlerName: string, config: any, expozrConfig: any): any {
    const adapter = this.bundlerRegistry.getAdapter(bundlerName);
    if (!adapter) {
      throw new Error(`Bundler adapter not found: ${bundlerName}`);
    }

    return adapter.configureExpozr(expozrConfig, config);
  }

  /**
   * Get the loader registry
   */
  getLoaderRegistry(): ModuleLoaderRegistry {
    return this.loaderRegistry;
  }

  /**
   * Get the bundler registry
   */
  getBundlerRegistry(): BundlerAdapterRegistry {
    return this.bundlerRegistry;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ModuleSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ModuleSystemConfig {
    return { ...this.config };
  }
}

/**
 * Create a default module system configuration
 */
export function createDefaultModuleSystemConfig(
  options: Partial<ModuleSystemConfig> = {}
): ModuleSystemConfig {
  return {
    primary: "esm",
    fallbacks: ["umd", "cjs"],
    strategy: "dynamic",
    hybrid: true,
    resolution: {
      extensions: [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"],
    },
    externals: {
      strategy: "mixed",
    },
    compatibility: {
      target: "es2018",
      legacy: false,
    },
    ...options,
  };
}

/**
 * Global module system instance
 */
let globalModuleSystem: UniversalModuleSystem | null = null;

/**
 * Get or create the global module system
 */
export function getGlobalModuleSystem(
  config?: ModuleSystemConfig
): UniversalModuleSystem {
  if (!globalModuleSystem) {
    const defaultConfig = createDefaultModuleSystemConfig(config);
    globalModuleSystem = new UniversalModuleSystem(defaultConfig);
  }
  return globalModuleSystem;
}

/**
 * Set the global module system
 */
export function setGlobalModuleSystem(
  moduleSystem: UniversalModuleSystem
): void {
  globalModuleSystem = moduleSystem;
}
