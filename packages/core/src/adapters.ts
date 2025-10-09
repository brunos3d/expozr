/**
 * Abstract bundler adapter for universal bundler support
 */

import type {
  WarehouseConfig,
  HostConfig,
  ModuleFormat,
  ModuleSystemConfig,
  BundlerAdapter,
  Inventory,
} from "./types";

/**
 * Abstract base class for bundler adapters
 */
export abstract class AbstractBundlerAdapter implements BundlerAdapter {
  abstract readonly name: string;

  abstract configureWarehouse(config: WarehouseConfig, bundlerConfig: any): any;
  abstract configureHost(config: HostConfig, bundlerConfig: any): any;
  abstract getDefaultConfig(): any;
  abstract isAvailable(): boolean;

  /**
   * Configure output for different module formats
   */
  protected configureModuleOutput(
    format: ModuleFormat | ModuleFormat[],
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any {
    const formats = Array.isArray(format) ? format : [format];
    const outputs: any[] = [];

    for (const fmt of formats) {
      outputs.push(this.createFormatConfig(fmt, bundlerConfig, moduleSystem));
    }

    return moduleSystem.hybrid && outputs.length > 1 ? outputs : outputs[0];
  }

  /**
   * Create configuration for a specific module format
   */
  protected abstract createFormatConfig(
    format: ModuleFormat,
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any;

  /**
   * Configure externals based on module system config
   */
  protected configureExternals(
    moduleSystem: ModuleSystemConfig,
    target: "browser" | "node" | "universal" = "universal"
  ): any {
    if (!moduleSystem.externals) return {};

    const { externals, strategy = "mixed" } = moduleSystem.externals;

    if (!externals) return {};

    if (Array.isArray(externals)) {
      // Simple array of external dependencies
      return externals.reduce(
        (acc, dep) => {
          acc[dep] = dep;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    // Complex external configuration
    const result: any = {};

    for (const [dep, config] of Object.entries(externals)) {
      if (typeof config === "string") {
        result[dep] = config;
      } else {
        result[dep] = this.createExternalConfig(config, strategy, target);
      }
    }

    return result;
  }

  /**
   * Create external configuration for a dependency
   */
  private createExternalConfig(
    config: any,
    strategy: string,
    target: "browser" | "node" | "universal"
  ): any {
    switch (strategy) {
      case "cdn":
        return config.cdn || config.esm || config.global;
      case "global":
        return config.global;
      case "import":
        return config.esm || config.commonjs;
      case "mixed":
      default:
        // Return different configs based on module format
        return {
          commonjs: config.commonjs || config.global,
          commonjs2: config.commonjs2 || config.commonjs || config.global,
          amd: config.amd || config.global,
          root: config.global,
          import: config.esm || config.global,
        };
    }
  }

  /**
   * Get target environment configuration
   */
  protected getTargetConfig(target: "browser" | "node" | "universal"): any {
    switch (target) {
      case "browser":
        return {
          platform: "browser",
          target: ["web"],
        };
      case "node":
        return {
          platform: "node",
          target: ["node"],
        };
      case "universal":
      default:
        return {
          platform: "neutral",
          target: ["web", "node"],
        };
    }
  }

  /**
   * Generate inventory from warehouse configuration
   */
  async generateInventory(config: WarehouseConfig): Promise<Inventory> {
    const { name, version, expose, dependencies = {}, metadata = {} } = config;
    const { build = {} } = config;
    const { publicPath = "/", outDir = "dist" } = build;

    const cargo: Record<string, any> = {};

    for (const [cargoName, cargoConfig] of Object.entries(expose)) {
      if (typeof cargoConfig === "string") {
        cargo[cargoName] = {
          name: cargoName,
          version,
          entry: this.getCargoEntryPath(cargoName, cargoConfig, build),
          dependencies: {},
          metadata: {},
        };
      } else {
        cargo[cargoName] = {
          name: cargoName,
          version,
          entry: this.getCargoEntryPath(cargoName, cargoConfig.entry, build),
          exports: cargoConfig.exports,
          dependencies: cargoConfig.dependencies || {},
          metadata: cargoConfig.metadata || {},
        };
      }
    }

    const baseUrl = this.resolveBaseUrl(publicPath);

    return {
      warehouse: {
        name,
        version,
        url: baseUrl,
        description: metadata.description,
        author: metadata.author,
      },
      cargo,
      dependencies,
      timestamp: Date.now(),
      checksum: this.generateChecksum({ cargo, dependencies }),
    };
  }

  /**
   * Get cargo entry path based on build configuration
   */
  protected getCargoEntryPath(
    cargoName: string,
    entry: string,
    build: any
  ): string {
    const { format, outDir = "dist" } = build;
    const formats = Array.isArray(format) ? format : [format || "esm"];

    // For hybrid mode, prefer ESM
    const preferredFormat = formats.includes("esm") ? "esm" : formats[0];

    const extension = this.getExtensionForFormat(preferredFormat);
    const fileName = `${cargoName}${extension}`;

    return fileName;
  }

  /**
   * Get file extension for module format
   */
  protected getExtensionForFormat(format: ModuleFormat): string {
    switch (format) {
      case "esm":
        return ".mjs";
      case "umd":
        return ".umd.js";
      case "cjs":
        return ".cjs";
      default:
        return ".js";
    }
  }

  /**
   * Resolve base URL for warehouse
   */
  protected resolveBaseUrl(publicPath: string): string {
    if (publicPath.startsWith("http")) {
      return publicPath;
    }

    // For relative paths, assume they'll be resolved at runtime
    return publicPath.endsWith("/") ? publicPath : `${publicPath}/`;
  }

  /**
   * Generate checksum for inventory integrity
   */
  protected generateChecksum(data: any): string {
    // Simple checksum implementation
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Validate warehouse configuration
   */
  protected validateWarehouseConfig(config: WarehouseConfig): void {
    if (!config.name) {
      throw new Error("Warehouse name is required");
    }

    if (!config.version) {
      throw new Error("Warehouse version is required");
    }

    if (!config.expose || Object.keys(config.expose).length === 0) {
      throw new Error("At least one cargo must be exposed");
    }
  }

  /**
   * Validate host configuration
   */
  protected validateHostConfig(config: HostConfig): void {
    if (!config.warehouses || Object.keys(config.warehouses).length === 0) {
      throw new Error("At least one warehouse must be configured");
    }
  }
}

/**
 * Utility functions for bundler adapters
 */
export class BundlerUtils {
  /**
   * Merge bundler configurations
   */
  static mergeConfigs(...configs: any[]): any {
    return configs.reduce((merged, config) => {
      if (!config) return merged;

      // Deep merge logic (simplified)
      return this.deepMerge(merged, config);
    }, {});
  }

  /**
   * Deep merge two objects
   */
  private static deepMerge(target: any, source: any): any {
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    return target;
  }

  /**
   * Check if value is an object
   */
  private static isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * Normalize module path for bundler
   */
  static normalizePath(path: string): string {
    return path.replace(/\\/g, "/");
  }

  /**
   * Get relative path between two paths
   */
  static getRelativePath(from: string, to: string): string {
    // Simplified relative path calculation
    const fromParts = from.split("/");
    const toParts = to.split("/");

    let commonLength = 0;
    for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }

    const upCount = fromParts.length - commonLength - 1;
    const relativeParts = Array(upCount)
      .fill("..")
      .concat(toParts.slice(commonLength));

    return relativeParts.join("/") || ".";
  }

  /**
   * Resolve module specifier
   */
  static resolveModuleSpecifier(
    specifier: string,
    baseUrl: string,
    alias?: Record<string, string>
  ): string {
    // Apply alias if available
    if (alias && alias[specifier]) {
      return alias[specifier];
    }

    // Handle relative imports
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      return new URL(specifier, baseUrl).href;
    }

    // Handle absolute imports
    if (specifier.startsWith("/")) {
      return new URL(specifier, baseUrl).href;
    }

    // Handle bare imports (npm packages)
    return specifier;
  }
}
