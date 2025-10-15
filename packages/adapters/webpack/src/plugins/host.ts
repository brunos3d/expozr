/**
 * Webpack plugin for Expozr hosts
 *
 * This plugin handles:
 * - Loading and validating host configuration
 * - Configuring externals for remote module consumption
 * - Setting up dynamic imports for module loading
 * - Development server CORS configuration
 */

import type { HostConfig, ExpozrReference } from "@expozr/core";
import { ValidationUtils, defaultHostConfig, ObjectUtils } from "@expozr/core";
import { loadHostConfigSync } from "@expozr/adapter-sdk";

export interface HostPluginOptions {
  /** Path to host config file */
  configFile?: string;
  /** Direct config object (overrides configFile) */
  config?: HostConfig;
}

/**
 * Webpack plugin for consuming from Expozr remotes
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
      this.configureWebpack(compiler);
    });
  }

  /**
   * Load host configuration from various sources
   */
  private async loadConfig(compiler: any): Promise<void> {
    // Use provided config directly
    if (this.options.config) {
      this.config = this.options.config;
      this.validateAndMergeConfig();
      console.log(
        `🏠 Using provided host config for ${Object.keys(this.config.expozrs).length} expozrs`
      );
      return;
    }

    // Load from SDK with automatic file discovery
    try {
      const result = loadHostConfigSync({
        configFile: this.options.configFile,
      });
      this.config = result.config;
      if (this.config) {
        console.log(
          `🏠 Loaded host config for ${Object.keys(this.config.expozrs).length} expozrs`
        );
      }
    } catch (error) {
      // If no host config found, create minimal config
      this.config = { expozrs: {} };
      console.log("🏠 No host config found, using minimal configuration");
    }

    this.validateAndMergeConfig();
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
      console.warn("⚠️ Invalid host configuration, using defaults");
    }
  }

  /**
   * Configure webpack for consuming external modules
   */
  private configureWebpack(compiler: any): void {
    if (!this.config || Object.keys(this.config.expozrs).length === 0) {
      return;
    }

    console.log(
      `🏠 Configuring Expozr host for ${Object.keys(this.config.expozrs).length} remotes`
    );

    // Configure externals for remote modules
    this.configureExternals(compiler);

    // Enable dynamic imports
    this.configureDynamicImports(compiler);

    // Configure development server
    this.configureDevServer(compiler);

    // Configure warning suppressions
    this.configureWarningSuppressions(compiler);
  }

  /**
   * Configure external modules for remote consumption
   */
  private configureExternals(compiler: any): void {
    const externals: Record<string, string> = {};

    for (const [expozrName, expozrRef] of Object.entries(
      this.config!.expozrs
    )) {
      const ref = expozrRef as ExpozrReference;
      const alias = ref.alias || expozrName;

      // Create external entries that Navigator can resolve at runtime
      externals[`@expozr/remote/${alias}`] = `expozr-remote-${alias}`;
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
      `📦 Configured ${Object.keys(externals).length} external remote modules`
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
        ...this.createRemoteAliases(),
      },
    };
  }

  /**
   * Create aliases for remote modules
   */
  private createRemoteAliases(): Record<string, string> {
    const aliases: Record<string, string> = {};

    for (const [expozrName, expozrRef] of Object.entries(
      this.config!.expozrs
    )) {
      const ref = expozrRef as ExpozrReference;
      const alias = ref.alias || expozrName;

      // Create aliases for easier imports
      aliases[`@expozr/${alias}`] = `@expozr/remote/${alias}`;
    }

    return aliases;
  }

  /**
   * Configure development server for remote consumption
   */
  private configureDevServer(compiler: any): void {
    if (!compiler.options.devServer) {
      compiler.options.devServer = {};
    }

    // Enable CORS for remote consumption
    compiler.options.devServer.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      ...compiler.options.devServer.headers,
    };
  }

  /**
   * Configure warning suppressions for remote-related warnings
   */
  private configureWarningSuppressions(compiler: any): void {
    const existingIgnoreWarnings = compiler.options.ignoreWarnings || [];

    const expozrWarningFilters = [
      // Suppress dynamic import warnings for Navigator
      (warning: any) => {
        return (
          warning.message &&
          warning.message.includes(
            "Critical dependency: the request of a dependency is an expression"
          )
        );
      },
      // Suppress externals warnings
      (warning: any) => {
        return (
          warning.message &&
          warning.message.includes("Module not found") &&
          warning.message.includes("@expozr/remote/")
        );
      },
    ];

    compiler.options.ignoreWarnings = [
      ...existingIgnoreWarnings,
      ...expozrWarningFilters,
    ];
  }
}
