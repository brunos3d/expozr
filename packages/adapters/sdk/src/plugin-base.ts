/**
 * Base plugin utilities for bundler adapters
 */

import type { ExpozrConfig, HostConfig, Inventory } from "@expozr/core";
import { ValidationUtils } from "@expozr/core";
import {
  loadExpozrConfig,
  loadHostConfig,
  loadExpozrConfigSync,
  loadHostConfigSync,
  type ConfigLoadOptions,
} from "./config-loader";
import { INVENTORY_FILE_NAME } from "./constants";

/**
 * Base options for bundler plugins
 */
export interface BasePluginOptions {
  /**
   * Custom config file path
   */
  configFile?: string;
  /**
   * Direct config object (bypasses file loading)
   */
  config?: ExpozrConfig | HostConfig;
  /**
   * Output path for generated files
   */
  outputPath?: string;
  /**
   * Public path for assets
   */
  publicPath?: string;
}

/**
 * Plugin context shared across bundler implementations
 */
export interface PluginContext {
  /**
   * Base directory for the build
   */
  baseDir: string;
  /**
   * Whether this is a development build
   */
  isDevelopment: boolean;
  /**
   * Whether this is a watch build
   */
  isWatch: boolean;
}

/**
 * Base class for Expozr bundler plugins
 */
export abstract class BaseExpozrPlugin {
  protected options: BasePluginOptions;
  protected config?: ExpozrConfig;
  protected context?: PluginContext;

  constructor(options: BasePluginOptions = {}) {
    this.options = options;
  }

  /**
   * Load and validate Expozr configuration
   */
  protected async loadConfig(context: PluginContext): Promise<void> {
    if (this.options.config) {
      this.config = this.options.config as ExpozrConfig;
      return;
    }

    const loadOptions: ConfigLoadOptions = {
      configFile: this.options.configFile,
      baseDir: context.baseDir,
      required: true,
    };

    const result = await loadExpozrConfig(loadOptions);

    if (result.error) {
      throw result.error;
    }

    if (!result.config) {
      throw new Error("No Expozr configuration found");
    }

    this.config = result.config;
  }

  /**
   * Load and validate Expozr configuration synchronously
   */
  protected loadConfigSync(context: PluginContext): void {
    if (this.options.config) {
      this.config = this.options.config as ExpozrConfig;
      return;
    }

    const loadOptions: ConfigLoadOptions = {
      configFile: this.options.configFile,
      baseDir: context.baseDir,
      required: true,
    };

    const result = loadExpozrConfigSync(loadOptions);

    if (result.error) {
      throw result.error;
    }

    if (!result.config) {
      throw new Error("No Expozr configuration found");
    }

    this.config = result.config;
  }

  /**
   * Generate inventory for the current configuration
   */
  protected async generateInventory(): Promise<Inventory> {
    if (!this.config) {
      throw new Error("Configuration not loaded");
    }

    // Use the core inventory generator
    const { InventoryGenerator } = await import("@expozr/core");

    return await InventoryGenerator.generate(this.config);
  }

  /**
   * Write inventory to file system
   */
  protected async writeInventory(
    inventory: Inventory,
    outputDir: string
  ): Promise<string> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const inventoryPath = path.join(outputDir, INVENTORY_FILE_NAME);

    await fs.writeFile(
      inventoryPath,
      JSON.stringify(inventory, null, 2),
      "utf-8"
    );

    return inventoryPath;
  }

  /**
   * Log plugin activity
   */
  protected log(
    message: string,
    level: "info" | "warn" | "error" = "info"
  ): void {
    const prefix = `🔧 Expozr`;

    switch (level) {
      case "warn":
        console.warn(`⚠️  ${prefix}: ${message}`);
        break;
      case "error":
        console.error(`❌ ${prefix}: ${message}`);
        break;
      default:
        console.log(`${prefix}: ${message}`);
    }
  }
}

/**
 * Base class for Expozr host plugins
 */
export abstract class BaseHostPlugin {
  protected options: BasePluginOptions;
  protected config?: HostConfig;
  protected context?: PluginContext;

  constructor(options: BasePluginOptions = {}) {
    this.options = options;
  }

  /**
   * Load and validate host configuration
   */
  protected async loadConfig(context: PluginContext): Promise<void> {
    if (this.options.config) {
      this.config = this.options.config as HostConfig;
      return;
    }

    const loadOptions: ConfigLoadOptions = {
      configFile: this.options.configFile,
      baseDir: context.baseDir,
      required: true,
    };

    const result = await loadHostConfig(loadOptions);

    if (result.error) {
      throw result.error;
    }

    if (!result.config) {
      throw new Error("No Host configuration found");
    }

    this.config = result.config;
  }

  /**
   * Load and validate host configuration synchronously
   */
  protected loadConfigSync(context: PluginContext): void {
    if (this.options.config) {
      this.config = this.options.config as HostConfig;
      return;
    }

    const loadOptions: ConfigLoadOptions = {
      configFile: this.options.configFile,
      baseDir: context.baseDir,
      required: true,
    };

    const result = loadHostConfigSync(loadOptions);

    if (result.error) {
      throw result.error;
    }

    if (!result.config) {
      throw new Error("No Host configuration found");
    }

    this.config = result.config;
  }

  /**
   * Log plugin activity
   */
  protected log(
    message: string,
    level: "info" | "warn" | "error" = "info"
  ): void {
    const prefix = `🏠 Expozr Host`;

    switch (level) {
      case "warn":
        console.warn(`⚠️  ${prefix}: ${message}`);
        break;
      case "error":
        console.error(`❌ ${prefix}: ${message}`);
        break;
      default:
        console.log(`${prefix}: ${message}`);
    }
  }
}
