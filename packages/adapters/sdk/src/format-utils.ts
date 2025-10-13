/**
 * Module format utilities for bundler adapters
 */

import type { ModuleFormat, ModuleSystemConfig } from "@expozr/core";
import { MODULE_FORMAT_EXTENSIONS, WEBPACK_EXTERNAL_TYPES } from "./constants";

/**
 * File naming configuration for a module format
 */
export interface FormatFileNaming {
  /**
   * Main file extension
   */
  extension: string;
  /**
   * Chunk file extension
   */
  chunkExtension: string;
}

/**
 * Webpack output configuration for a format
 */
export interface WebpackFormatConfig {
  filename: string;
  chunkFilename: string;
  library?: {
    name?: string;
    type: string;
    export?: string;
  };
  module?: boolean;
  environment?: {
    module?: boolean;
    dynamicImport?: boolean;
    arrowFunction?: boolean;
  };
}

/**
 * Vite/Rollup output configuration for a format
 */
export interface ViteFormatConfig {
  format: string;
  entryFileNames: string;
  chunkFileNames: string;
  name?: string;
}

/**
 * Get file naming configuration for a module format
 */
export function getFormatFileNaming(format: ModuleFormat): FormatFileNaming {
  return (
    MODULE_FORMAT_EXTENSIONS[format as keyof typeof MODULE_FORMAT_EXTENSIONS] ||
    MODULE_FORMAT_EXTENSIONS.esm
  );
}

/**
 * Generate filename pattern for webpack
 */
export function getWebpackFilename(
  format: ModuleFormat,
  name = "[name]"
): string {
  const { extension } = getFormatFileNaming(format);
  return `${name}${extension}`;
}

/**
 * Generate chunk filename pattern for webpack
 */
export function getWebpackChunkFilename(
  format: ModuleFormat,
  name = "[name]-[contenthash]"
): string {
  const { chunkExtension } = getFormatFileNaming(format);
  return `${name}${chunkExtension}`;
}

/**
 * Create webpack output configuration for a specific format
 */
export function createWebpackFormatConfig(
  format: ModuleFormat,
  entryName?: string
): WebpackFormatConfig {
  const config: WebpackFormatConfig = {
    filename: getWebpackFilename(format),
    chunkFilename: getWebpackChunkFilename(format),
  };

  switch (format) {
    case "esm":
      config.library = {
        type: "module",
      };
      config.module = true;
      config.environment = {
        module: true,
        dynamicImport: true,
        arrowFunction: true,
      };
      break;

    case "umd":
      config.library = {
        name: entryName || "[name]",
        type: "umd",
        export: "default",
      };
      break;

    case "cjs":
      config.library = {
        type: "commonjs2",
      };
      break;
  }

  return config;
}

/**
 * Create Vite/Rollup output configuration for a specific format
 */
export function createViteFormatConfig(
  format: ModuleFormat,
  entryName?: string
): ViteFormatConfig {
  const { extension, chunkExtension } = getFormatFileNaming(format);

  const config: ViteFormatConfig = {
    format: format === "esm" ? "es" : format,
    entryFileNames: `[name]${extension}`,
    chunkFileNames: `[name]-[hash]${chunkExtension}`,
  };

  if (format === "umd" && entryName) {
    config.name = entryName;
  }

  return config;
}

/**
 * Determine if output module should be enabled for webpack
 */
export function shouldEnableWebpackOutputModule(
  format: ModuleFormat | ModuleFormat[]
): boolean {
  const formats = Array.isArray(format) ? format : [format];
  return formats.includes("esm");
}

/**
 * Get webpack external type for a module format
 */
export function getWebpackExternalType(format: ModuleFormat): string {
  return (
    WEBPACK_EXTERNAL_TYPES[format as keyof typeof WEBPACK_EXTERNAL_TYPES] ||
    "module"
  );
}

/**
 * Create multiple format configurations for webpack
 */
export function createMultiFormatWebpackConfigs(
  formats: ModuleFormat[],
  baseConfig: any,
  entryName?: string
): any[] {
  return formats.map((format) => ({
    ...baseConfig,
    output: {
      ...baseConfig.output,
      ...createWebpackFormatConfig(format, entryName),
    },
    experiments: {
      ...baseConfig.experiments,
      outputModule: format === "esm",
    },
  }));
}

/**
 * Create multiple format configurations for Vite
 */
export function createMultiFormatViteConfigs(
  formats: ModuleFormat[],
  entryName?: string
): ViteFormatConfig[] {
  return formats.map((format) => createViteFormatConfig(format, entryName));
}

/**
 * Normalize format configuration
 */
export function normalizeFormats(
  format: ModuleFormat | ModuleFormat[]
): ModuleFormat[] {
  return Array.isArray(format) ? format : [format];
}

/**
 * Determine primary format from module system config
 */
export function getPrimaryFormat(
  moduleSystem: ModuleSystemConfig
): ModuleFormat {
  return moduleSystem.primary || "esm";
}

/**
 * Get all formats including fallbacks from module system config
 */
export function getAllFormats(
  format: ModuleFormat | ModuleFormat[],
  moduleSystem: ModuleSystemConfig
): ModuleFormat[] {
  const normalizedFormats = normalizeFormats(format);
  const fallbacks = moduleSystem.fallbacks || [];

  // Combine and deduplicate
  const allFormats = [...new Set([...normalizedFormats, ...fallbacks])];

  return allFormats;
}
