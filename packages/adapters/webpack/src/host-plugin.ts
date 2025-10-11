/**
 * Webpack adapter for Expozr - Host Plugin
 * Enables consumption of modules from expozrs
 */

// Dynamic imports for Node.js modules
declare const require: any;

import type { HostConfig, ExpozrReference } from "@expozr/core";

import {
  validateExpozrConfig,
  defaultHostConfig,
  deepMerge,
} from "@expozr/core";

export interface HostPluginOptions {
  configFile?: string;
  config?: HostConfig;
}

/**
 * Webpack plugin for consuming from Expozr expozrs
 */
export class ExpozrHostPlugin {
  private options: HostPluginOptions;
  private config?: HostConfig;

  constructor(options: HostPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: any): void {
    const pluginName = "ExpozrHostPlugin";

    // Load configuration
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

  private async loadConfig(compiler: any): Promise<void> {
    const path = require("path");
    const fs = require("fs");

    if (this.options.config) {
      this.config = this.options.config;
      return;
    }

    if (this.options.configFile) {
      const configPath = path.resolve(
        compiler.context,
        this.options.configFile
      );

      if (fs.existsSync(configPath)) {
        try {
          const configModule = await import(configPath);
          this.config = configModule.default || configModule;
        } catch {
          delete require.cache[configPath];
          this.config = require(configPath);
        }
      }
    }

    if (!this.config) {
      // Look for default config files
      const defaultConfigs = [
        "expozr.host.config.ts",
        "expozr.host.config.js",
        "expozr.config.ts",
        "expozr.config.js",
      ];

      for (const configFile of defaultConfigs) {
        const configPath = path.resolve(compiler.context, configFile);
        if (fs.existsSync(configPath)) {
          try {
            const configModule = await import(configPath);
            this.config = configModule.default || configModule;
            break;
          } catch {
            try {
              delete require.cache[configPath];
              this.config = require(configPath);
              break;
            } catch {
              // Continue to next config file
            }
          }
        }
      }
    }

    if (!this.config) {
      throw new Error("No Expozr host configuration found");
    }

    // Merge with defaults
    this.config = deepMerge(defaultHostConfig, this.config) as HostConfig;
  }

  private configureWebpack(compiler: any): void {
    if (!this.config) return;

    // Configure externals for expozr modules
    const externals: Record<string, string> = {};

    for (const [expozrName, expozrRef] of Object.entries(this.config.expozrs)) {
      // Create external entries that can be loaded at runtime
      const ref = expozrRef as ExpozrReference;
      const alias = ref.alias || expozrName;
      externals[`@expozr/expozr/${alias}`] = `expozr-expozr-${alias}`;
    }

    // Add externals to webpack config
    if (!compiler.options.externals) {
      compiler.options.externals = {};
    }

    Object.assign(compiler.options.externals, externals);

    // Enable experiments for dynamic imports
    compiler.options.experiments = {
      ...compiler.options.experiments,
      dynamicImport: true,
    };

    console.log(
      `🏠 Expozr host configured for ${Object.keys(this.config.expozrs).length} expozrs`
    );
  }
}
