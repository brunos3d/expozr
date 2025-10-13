/**
 * Configuration loading utilities for bundler adapters
 */

import type { ExpozrConfig, HostConfig } from "@expozr/core";
import { ValidationUtils, defaultHostConfig, ObjectUtils } from "@expozr/core";
import { EXPOZR_CONFIG_FILES, HOST_CONFIG_FILES } from "./constants";

/**
 * Options for loading configuration files
 */
export interface ConfigLoadOptions {
  /**
   * Custom config file path
   */
  configFile?: string;
  /**
   * Base directory to search for config files
   */
  baseDir?: string;
  /**
   * Whether to throw error if no config is found
   */
  required?: boolean;
}

/**
 * Result of config loading operation
 */
export interface ConfigLoadResult<T> {
  config: T | undefined;
  configPath?: string;
  error?: Error;
}

/**
 * Load Expozr configuration from file system
 */
export async function loadExpozrConfig(
  options: ConfigLoadOptions = {}
): Promise<ConfigLoadResult<ExpozrConfig>> {
  const { configFile, baseDir = process.cwd(), required = false } = options;

  try {
    const result = await loadConfigFile<ExpozrConfig>(
      configFile ? [configFile] : EXPOZR_CONFIG_FILES,
      baseDir
    );

    if (!result.config && required) {
      throw new Error("No Expozr configuration found");
    }

    if (result.config && !ValidationUtils.validateExpozrConfig(result.config)) {
      throw new Error("Invalid Expozr configuration");
    }

    return result;
  } catch (error) {
    return {
      config: undefined,
      error: error as Error,
    };
  }
}

/**
 * Load Host configuration from file system
 */
export async function loadHostConfig(
  options: ConfigLoadOptions = {}
): Promise<ConfigLoadResult<HostConfig>> {
  const { configFile, baseDir = process.cwd(), required = false } = options;

  try {
    const result = await loadConfigFile<HostConfig>(
      configFile ? [configFile] : HOST_CONFIG_FILES,
      baseDir
    );

    if (!result.config && required) {
      throw new Error("No Host configuration found");
    }

    if (result.config) {
      // Merge with defaults
      result.config = ObjectUtils.deepMerge(
        defaultHostConfig,
        result.config
      ) as HostConfig;
    }

    return result;
  } catch (error) {
    return {
      config: undefined,
      error: error as Error,
    };
  }
}

/**
 * Load configuration file with fallback support
 */
async function loadConfigFile<T>(
  configFiles: readonly string[],
  baseDir: string
): Promise<ConfigLoadResult<T>> {
  const path = await import("path");
  const fs = await import("fs");

  for (const configFile of configFiles) {
    const configPath = path.resolve(baseDir, configFile);

    if (!fs.existsSync(configPath)) {
      continue;
    }

    try {
      // Try dynamic import first (supports ES modules)
      const configModule = await import(configPath);
      const config = configModule.default || configModule;

      return {
        config,
        configPath,
      };
    } catch (importError) {
      try {
        // Fallback to require for CommonJS
        delete require.cache[configPath];
        const config = require(configPath);

        return {
          config: config.default || config,
          configPath,
        };
      } catch (requireError) {
        // Continue to next config file
        console.warn(
          `Failed to load config file ${configFile}:`,
          (requireError as Error).message
        );
      }
    }
  }

  return { config: undefined };
}

/**
 * Synchronous config loading for legacy compatibility
 */
export function loadExpozrConfigSync(
  options: ConfigLoadOptions = {}
): ConfigLoadResult<ExpozrConfig> {
  const { configFile, baseDir = process.cwd(), required = false } = options;

  try {
    const result = loadConfigFileSync<ExpozrConfig>(
      configFile ? [configFile] : EXPOZR_CONFIG_FILES,
      baseDir
    );

    if (!result.config && required) {
      throw new Error("No Expozr configuration found");
    }

    if (result.config && !ValidationUtils.validateExpozrConfig(result.config)) {
      throw new Error("Invalid Expozr configuration");
    }

    return result;
  } catch (error) {
    return {
      config: undefined,
      error: error as Error,
    };
  }
}

/**
 * Synchronous host config loading for legacy compatibility
 */
export function loadHostConfigSync(
  options: ConfigLoadOptions = {}
): ConfigLoadResult<HostConfig> {
  const { configFile, baseDir = process.cwd(), required = false } = options;

  try {
    const result = loadConfigFileSync<HostConfig>(
      configFile ? [configFile] : HOST_CONFIG_FILES,
      baseDir
    );

    if (!result.config && required) {
      throw new Error("No Host configuration found");
    }

    if (result.config) {
      // Merge with defaults
      result.config = ObjectUtils.deepMerge(
        defaultHostConfig,
        result.config
      ) as HostConfig;
    }

    return result;
  } catch (error) {
    return {
      config: undefined,
      error: error as Error,
    };
  }
}

/**
 * Synchronous config file loading
 */
function loadConfigFileSync<T>(
  configFiles: readonly string[],
  baseDir: string
): ConfigLoadResult<T> {
  const path = require("path");
  const fs = require("fs");

  for (const configFile of configFiles) {
    const configPath = path.resolve(baseDir, configFile);

    if (!fs.existsSync(configPath)) {
      continue;
    }

    try {
      delete require.cache[configPath];
      const configModule = require(configPath);
      const config = configModule.default || configModule;

      return {
        config,
        configPath,
      };
    } catch (error) {
      console.warn(
        `Failed to load config file ${configFile}:`,
        (error as Error).message
      );
    }
  }

  return { config: undefined };
}
