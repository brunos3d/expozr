/**
 * Base bundler adapter implementation with common functionality
 */

import type {
  BundlerAdapter,
  ExpozrConfig,
  HostConfig,
  Inventory,
  ModuleFormat,
  ModuleSystemConfig,
} from "../types";
import { InventoryGenerator } from "./inventory-generator";
import { ExternalConfigurationManager } from "./external-configuration";
import { ModuleFormatUtils } from "./format-utils";
import { ValidationUtils } from "../utils";

/**
 * Abstract base class for bundler adapters providing common functionality
 * and enforcing the adapter contract for different bundlers.
 */
export abstract class AbstractBundlerAdapter implements BundlerAdapter {
  /** The name of the bundler this adapter supports */
  abstract readonly name: string;

  /**
   * Configure the bundler for expozr build
   */
  abstract configureExpozr(config: ExpozrConfig, bundlerConfig: any): any;

  /**
   * Configure the bundler for host application
   */
  abstract configureHost(config: HostConfig, bundlerConfig: any): any;

  /**
   * Get default configuration for the bundler
   */
  abstract getDefaultConfig(): any;

  /**
   * Check if the bundler is available in the current environment
   */
  abstract isAvailable(): boolean;

  /**
   * Configure output for different module formats
   * Handles both single format and multi-format (hybrid) builds
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

    // Return array for hybrid mode, single config otherwise
    return moduleSystem.hybrid && outputs.length > 1 ? outputs : outputs[0];
  }

  /**
   * Create configuration for a specific module format
   * Must be implemented by concrete adapters
   */
  protected abstract createFormatConfig(
    format: ModuleFormat,
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any;

  /**
   * Configure externals based on module system configuration
   */
  protected configureExternals(
    moduleSystem: ModuleSystemConfig,
    target: "browser" | "node" | "universal" = "universal"
  ): any {
    return ExternalConfigurationManager.configure(moduleSystem, target);
  }

  /**
   * Get target environment configuration for the bundler
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
   * Generate inventory manifest from expozr configuration
   */
  async generateInventory(config: ExpozrConfig): Promise<Inventory> {
    return InventoryGenerator.generate(config);
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

    const extension = ModuleFormatUtils.getExtensionForFormat(preferredFormat);
    const fileName = `${cargoName}${extension}`;

    return fileName;
  }

  /**
   * Resolve base URL for expozr
   */
  protected resolveBaseUrl(publicPath: string): string {
    if (publicPath.startsWith("http")) {
      return publicPath;
    }

    // For relative paths, assume they'll be resolved at runtime
    return publicPath.endsWith("/") ? publicPath : `${publicPath}/`;
  }

  /**
   * Validate expozr configuration
   */
  protected validateExpozrConfig(config: ExpozrConfig): void {
    ValidationUtils.validateExpozrConfig(config);
  }

  /**
   * Validate host configuration
   */
  protected validateHostConfig(config: HostConfig): void {
    ValidationUtils.validateHostConfig(config);
  }
}
