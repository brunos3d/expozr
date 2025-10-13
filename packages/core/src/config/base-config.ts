/**
 * Base configuration definitions and helpers
 */

import type {
  ExpozrConfig,
  HostConfig,
  CargoConfig,
  ModuleSystemConfig,
  ModuleFormat,
} from "../types";
import { ValidationUtils } from "../utils/validation";

/**
 * Helper to define expozr configuration with type safety and validation
 */
export function defineExpozrConfig(config: ExpozrConfig): ExpozrConfig {
  // Validate the configuration
  ValidationUtils.validateExpozrConfig(config);

  // Merge with defaults
  return {
    ...defaultExpozrConfig,
    ...config,
    build: {
      ...defaultExpozrConfig.build,
      ...config.build,
    },
    metadata: {
      ...defaultExpozrConfig.metadata,
      ...config.metadata,
    },
  };
}

/**
 * Helper to define host configuration with type safety and validation
 */
export function defineHostConfig(config: HostConfig): HostConfig {
  // Validate the configuration
  ValidationUtils.validateHostConfig(config);

  // Merge with defaults
  return {
    ...defaultHostConfig,
    ...config,
    loading: {
      ...defaultHostConfig.loading!,
      ...config.loading,
    },
    cache: {
      ...defaultHostConfig.cache!,
      ...config.cache,
    },
  };
}

/**
 * Helper to define cargo configuration with type safety
 */
export function defineCargoConfig(config: CargoConfig): CargoConfig {
  return config;
}

/**
 * Default expozr configuration template
 */
export const defaultExpozrConfig = {
  build: {
    outDir: "dist",
    publicPath: "/",
    sourcemap: true,
    minify: true,
    target: "universal" as const,
    format: ["esm", "umd"] as ModuleFormat[],
    moduleSystem: createModuleSystemDefaults(),
  },
  metadata: {
    license: "MIT",
  },
};

/**
 * Default host configuration
 */
export const defaultHostConfig: HostConfig = {
  cache: {
    strategy: "memory",
    ttl: 3600000, // 1 hour
    persist: false,
  },
  loading: {
    timeout: 30000, // 30 seconds
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 2,
    },
    preload: {
      enabled: false,
    },
  },
  expozrs: {},
};

/**
 * Helper to create module system configuration with defaults
 */
export function defineModuleSystemConfig(
  config: Partial<ModuleSystemConfig>
): ModuleSystemConfig {
  return {
    ...createModuleSystemDefaults(),
    ...config,
  };
}

/**
 * Create default module system configuration
 */
export function createModuleSystemDefaults(
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
