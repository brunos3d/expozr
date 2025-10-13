/**
 * Webpack adapter for Expozr - Host Plugin
 * Enables consumption of modules from Expozr warehouses
 */

// Dynamic imports for Node.js modules
declare const require: any;

import type { HostConfig, ExpozrReference } from "@expozr/core";
import { ValidationUtils, defaultHostConfig, ObjectUtils } from "@expozr/core";

export interface HostPluginOptions {
  configFile?: string;
  config?: HostConfig;
}

/**
 * Webpack plugin for consuming from Expozr warehouses
 *
 * Features:
 * - Automatic host configuration loading
 * - External module mapping for warehouse consumption
 * - Dynamic import configuration
 * - Development server CORS support
 */
export class ExpozrHostPlugin {
  private options: HostPluginOptions;
  private config?: HostConfig;

  constructor(options: HostPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: any): void {
    const pluginName = "ExpozrHostPlugin";

    // Load configuration before compilation
    compiler.hooks.beforeRun.tapAsync(
      pluginName,
      async (compiler: any, callback: any) => {
        try {
          await this.loadConfig(compiler);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      }
    );

    // Configure webpack for consuming external modules
    compiler.hooks.beforeCompile.tap(pluginName, () => {
      if (this.config) {
        this.configureWebpack(compiler);
      }
    });
  }

  /**
   * Load host configuration from file system
   */
  private async loadConfig(compiler: any): Promise<void> {
    const path = require("path");
    const fs = require("fs");

    // Use provided config
    if (this.options.config) {
      this.config = this.options.config;
      this.validateAndMergeConfig();
      return;
    }

    // Load from specified config file
    if (this.options.configFile) {
      const configPath = path.resolve(
        compiler.context,
        this.options.configFile
      );
      this.config = await this.loadConfigFile(configPath);
      this.validateAndMergeConfig();
      return;
    }

    // Search for default config files
    const defaultConfigs = [
      "expozr.host.config.ts",
      "expozr.host.config.js",
      "expozr.host.config.mjs",
      "expozr.host.config.cjs",
      "expozr.config.ts",
      "expozr.config.js",
      "expozr.config.mjs",
      "expozr.config.cjs",
    ];

    for (const configFile of defaultConfigs) {
      const configPath = path.resolve(compiler.context, configFile);
      if (fs.existsSync(configPath)) {
        try {
          this.config = await this.loadConfigFile(configPath);
          console.log(`🏠 Loaded Expozr host config from ${configFile}`);
          break;
        } catch (error) {
          console.warn(
            `⚠️  Failed to load ${configFile}: ${(error as Error).message}`
          );
        }
      }
    }

    if (!this.config) {
      throw new Error(
        "No Expozr host configuration found. Please create expozr.host.config.js or include host config in expozr.config.js"
      );
    }

    this.validateAndMergeConfig();
  }

  /**
   * Load configuration file with both ES modules and CommonJS support
   */
  private async loadConfigFile(configPath: string): Promise<HostConfig> {
    try {
      // Try dynamic import first (supports ES modules)
      const configModule = await import(configPath);
      return configModule.default || configModule;
    } catch (importError) {
      try {
        // Fallback to require for CommonJS
        delete require.cache[configPath];
        const configModule = require(configPath);
        return configModule.default || configModule;
      } catch (requireError) {
        throw new Error(
          `Failed to load config file ${configPath}: ${(requireError as Error).message}`
        );
      }
    }
  }

  /**
   * Validate configuration and merge with defaults
   */
  private validateAndMergeConfig(): void {
    if (!this.config) return;

    // Merge with defaults
    this.config = ObjectUtils.deepMerge(
      defaultHostConfig,
      this.config
    ) as HostConfig;

    // Validate final configuration
    if (!ValidationUtils.validateHostConfig?.(this.config)) {
      console.warn("⚠️  Host configuration may be invalid");
    }
  }

  /**
   * Configure webpack for consuming external modules
   */
  private configureWebpack(compiler: any): void {
    if (!this.config) return;

    console.log(
      `🏠 Configuring Expozr host for ${Object.keys(this.config.expozrs).length} warehouses`
    );

    // Configure externals for warehouse modules
    this.configureExternals(compiler);

    // Enable dynamic imports
    this.configureDynamicImports(compiler);

    // Configure development server
    this.configureDevServer(compiler);

    // Configure warning suppressions
    this.configureWarningSuppressions(compiler);

    console.log("✅ Expozr host configuration applied");
  }

  /**
   * Configure external modules for warehouse consumption
   */
  private configureExternals(compiler: any): void {
    const externals: Record<string, string> = {};

    for (const [warehouseName, warehouseRef] of Object.entries(
      this.config!.expozrs
    )) {
      const ref = warehouseRef as ExpozrReference;
      const alias = ref.alias || warehouseName;

      // Create external entries that can be loaded at runtime
      externals[`@expozr/expozr/${alias}`] = `expozr-expozr-${alias}`;

      // Also support direct warehouse module access
      externals[`@expozr/${alias}`] = `expozr-${alias}`;
    }

    // Add externals to webpack config
    if (!compiler.options.externals) {
      compiler.options.externals = {};
    }

    if (typeof compiler.options.externals === "object") {
      Object.assign(compiler.options.externals, externals);
    } else if (Array.isArray(compiler.options.externals)) {
      compiler.options.externals.push(externals);
    }

    console.log(
      `📦 Configured ${Object.keys(externals).length} external warehouse modules`
    );
  }

  /**
   * Configure dynamic imports and experiments
   */
  private configureDynamicImports(compiler: any): void {
    compiler.options.experiments = {
      ...compiler.options.experiments,
      dynamicImport: true,
    };

    // Support for dynamic imports in module resolution
    compiler.options.resolve = {
      ...compiler.options.resolve,
      alias: {
        ...compiler.options.resolve?.alias,
        // Add warehouse aliases for easier imports
        ...this.createWarehouseAliases(),
      },
    };
  }

  /**
   * Create aliases for warehouse modules
   */
  private createWarehouseAliases(): Record<string, string> {
    const aliases: Record<string, string> = {};

    for (const [warehouseName, warehouseRef] of Object.entries(
      this.config!.expozrs
    )) {
      const ref = warehouseRef as ExpozrReference;
      const alias = ref.alias || warehouseName;

      // Create convenient aliases
      aliases[`@warehouse/${alias}`] = `@expozr/expozr/${alias}`;
      aliases[`@wh/${alias}`] = `@expozr/expozr/${alias}`;
    }

    return aliases;
  }

  /**
   * Configure development server for warehouse consumption
   */
  private configureDevServer(compiler: any): void {
    if (!compiler.options.devServer) {
      compiler.options.devServer = {};
    }

    // Enable CORS for warehouse consumption
    compiler.options.devServer.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
      ...compiler.options.devServer.headers,
    };

    // Note: Proxy configuration would be handled at the application level
    // not in the warehouse configuration itself
  }

  /**
   * Configure warning suppressions for warehouse-related warnings
   */
  private configureWarningSuppressions(compiler: any): void {
    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [];
    }

    // Suppress warnings related to external warehouse modules
    const warehouseWarnings = [
      (warning: Error) => {
        const message = warning.message;
        return (
          message.includes("Module not found") &&
          (message.includes("@expozr/") ||
            message.includes("@warehouse/") ||
            message.includes("@wh/"))
        );
      },
      (warning: Error) => {
        const message = warning.message;
        return (
          message.includes("Critical dependency") &&
          message.includes("@expozr/")
        );
      },
    ];

    compiler.options.ignoreWarnings.push(...warehouseWarnings);
  }
}
