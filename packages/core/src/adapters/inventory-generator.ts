/**
 * Inventory generation utilities for expozrs
 */

import type { ExpozrConfig, Inventory, Cargo } from "../types";
import { ChecksumUtils } from "../utils/checksum";

/**
 * Generates inventory manifests from expozr configurations
 */
export class InventoryGenerator {
  /**
   * Generate inventory from expozr configuration
   */
  static async generate(config: ExpozrConfig): Promise<Inventory> {
    const { name, version, expose, dependencies = {}, metadata = {} } = config;
    const { build = {} } = config;
    const { publicPath = "/", outDir = "dist" } = build;

    const cargo = this.generateCargoManifest(expose, version, build);
    const baseUrl = this.resolveBaseUrl(publicPath);

    const inventory: Inventory = {
      expozr: {
        name,
        version,
        url: baseUrl,
        description: metadata.description,
        author: metadata.author,
      },
      cargo,
      dependencies,
      timestamp: Date.now(),
      checksum: ChecksumUtils.generate({ cargo, dependencies }),
    };

    return inventory;
  }

  /**
   * Generate cargo manifest from expose configuration
   */
  private static generateCargoManifest(
    expose: ExpozrConfig["expose"],
    version: string,
    build: any
  ): Record<string, Cargo> {
    const cargo: Record<string, Cargo> = {};

    for (const [cargoName, cargoConfig] of Object.entries(expose)) {
      if (typeof cargoConfig === "string") {
        cargo[cargoName] = this.createSimpleCargo(
          cargoName,
          cargoConfig,
          version,
          build
        );
      } else {
        cargo[cargoName] = this.createDetailedCargo(
          cargoName,
          cargoConfig,
          version,
          build
        );
      }
    }

    return cargo;
  }

  /**
   * Create a simple cargo configuration from string entry
   */
  private static createSimpleCargo(
    cargoName: string,
    entry: string,
    version: string,
    build: any
  ): Cargo {
    return {
      name: cargoName,
      version,
      entry: this.getCargoEntryPath(cargoName, entry, build),
      dependencies: {},
      metadata: {},
    };
  }

  /**
   * Create a detailed cargo configuration from object entry
   */
  private static createDetailedCargo(
    cargoName: string,
    cargoConfig: any,
    version: string,
    build: any
  ): Cargo {
    return {
      name: cargoName,
      version,
      entry: this.getCargoEntryPath(cargoName, cargoConfig.entry, build),
      exports: cargoConfig.exports,
      dependencies: cargoConfig.dependencies || {},
      metadata: cargoConfig.metadata || {},
    };
  }

  /**
   * Get cargo entry path based on build configuration
   */
  private static getCargoEntryPath(
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
  private static getExtensionForFormat(format: string): string {
    switch (format) {
      case "esm":
        return ".mjs";
      case "umd":
        return ".umd.js";
      case "cjs":
        return ".cjs";
      case "amd":
        return ".amd.js";
      case "iife":
        return ".iife.js";
      case "system":
        return ".system.js";
      default:
        return ".js";
    }
  }

  /**
   * Resolve base URL for expozr
   */
  private static resolveBaseUrl(publicPath: string): string {
    if (publicPath.startsWith("http")) {
      return publicPath;
    }

    // For relative paths, assume they'll be resolved at runtime
    return publicPath.endsWith("/") ? publicPath : `${publicPath}/`;
  }

  /**
   * Validate inventory structure before generation
   */
  static validateConfig(config: ExpozrConfig): void {
    if (!config.name) {
      throw new Error("Expozr name is required");
    }

    if (!config.version) {
      throw new Error("Expozr version is required");
    }

    if (!config.expose || Object.keys(config.expose).length === 0) {
      throw new Error("At least one cargo must be exposed");
    }

    // Validate version format
    if (!this.isValidVersion(config.version)) {
      throw new Error(`Invalid version format: ${config.version}`);
    }
  }

  /**
   * Check if version string is valid semver
   */
  private static isValidVersion(version: string): boolean {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }
}
