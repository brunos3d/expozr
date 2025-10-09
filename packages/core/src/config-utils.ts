/**
 * Configuration utilities for the universal module system
 */

import type {
  WarehouseConfig,
  HostConfig,
  ModuleSystemConfig,
  ModuleFormat,
} from "./types";

import { defineWarehouseConfig, defineHostConfig } from "./config";

import { createDefaultModuleSystemConfig } from "./module-system";

/**
 * Create ESM-only warehouse configuration
 */
export function createESMWarehouseConfig(
  config: Omit<WarehouseConfig, "build"> & {
    build?: Partial<WarehouseConfig["build"]>;
  }
): WarehouseConfig {
  return defineWarehouseConfig({
    ...config,
    build: {
      ...config.build,
      format: "esm",
      moduleSystem: createDefaultModuleSystemConfig({
        primary: "esm",
        strategy: "dynamic",
        hybrid: false,
      }),
    },
  });
}

/**
 * Create UMD-only warehouse configuration
 */
export function createUMDWarehouseConfig(
  config: Omit<WarehouseConfig, "build"> & {
    build?: Partial<WarehouseConfig["build"]>;
  }
): WarehouseConfig {
  return defineWarehouseConfig({
    ...config,
    build: {
      ...config.build,
      format: "umd",
      moduleSystem: createDefaultModuleSystemConfig({
        primary: "umd",
        strategy: "dynamic",
        hybrid: false,
      }),
    },
  });
}

/**
 * Create hybrid warehouse configuration (both ESM and UMD)
 */
export function createHybridWarehouseConfig(
  config: Omit<WarehouseConfig, "build"> & {
    build?: Partial<WarehouseConfig["build"]>;
  }
): WarehouseConfig {
  return defineWarehouseConfig({
    ...config,
    build: {
      ...config.build,
      format: ["esm", "umd"],
      moduleSystem: createDefaultModuleSystemConfig({
        primary: "esm",
        fallbacks: ["umd"],
        strategy: "dynamic",
        hybrid: true,
      }),
    },
  });
}

/**
 * Create warehouse configuration with custom formats
 */
export function createCustomWarehouseConfig(
  config: Omit<WarehouseConfig, "build"> & {
    build?: Partial<WarehouseConfig["build"]>;
  },
  formats: ModuleFormat[],
  moduleSystemConfig?: Partial<ModuleSystemConfig>
): WarehouseConfig {
  return defineWarehouseConfig({
    ...config,
    build: {
      ...config.build,
      format: formats,
      moduleSystem: createDefaultModuleSystemConfig({
        primary: formats[0],
        fallbacks: formats.slice(1),
        hybrid: formats.length > 1,
        ...moduleSystemConfig,
      }),
    },
  });
}

/**
 * Create host configuration optimized for modern browsers
 */
export function createModernHostConfig(
  config: Partial<HostConfig> = {}
): HostConfig {
  return defineHostConfig({
    warehouses: {},
    ...config,
    loading: {
      timeout: 30000,
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 1.5,
      },
      preload: {
        enabled: true,
      },
      ...config.loading,
    },
    cache: {
      strategy: "indexedDB",
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      persist: true,
      ...config.cache,
    },
  });
}

/**
 * Create host configuration optimized for legacy browsers
 */
export function createLegacyHostConfig(
  config: Partial<HostConfig> = {}
): HostConfig {
  return defineHostConfig({
    warehouses: {},
    ...config,
    loading: {
      timeout: 60000, // Longer timeout for legacy browsers
      retry: {
        attempts: 5,
        delay: 2000,
        backoff: 2,
      },
      preload: {
        enabled: false, // Disable preloading for performance
      },
      ...config.loading,
    },
    cache: {
      strategy: "localStorage",
      ttl: 12 * 60 * 60 * 1000, // 12 hours
      persist: true,
      ...config.cache,
    },
  });
}

/**
 * Create host configuration for Node.js environments
 */
export function createNodeHostConfig(
  config: Partial<HostConfig> = {}
): HostConfig {
  return defineHostConfig({
    warehouses: {},
    ...config,
    loading: {
      timeout: 15000,
      retry: {
        attempts: 2,
        delay: 500,
      },
      preload: {
        enabled: false,
      },
      ...config.loading,
    },
    cache: {
      strategy: "memory",
      ttl: 60 * 60 * 1000, // 1 hour
      persist: false,
      ...config.cache,
    },
  });
}

/**
 * Preset configurations for common use cases
 */
export const presets = {
  /**
   * React component library warehouse
   */
  reactWarehouse: (config: Omit<WarehouseConfig, "build">) =>
    createHybridWarehouseConfig({
      ...config,
      build: {
        target: "browser",
        sourcemap: true,
        minify: true,
        moduleSystem: createDefaultModuleSystemConfig({
          externals: {
            externals: {
              react: {
                global: "React",
                esm: "react",
                commonjs: "react",
              },
              "react-dom": {
                global: "ReactDOM",
                esm: "react-dom",
                commonjs: "react-dom",
              },
            },
            strategy: "mixed",
          },
        }),
      },
    }),

  /**
   * Vue component library warehouse
   */
  vueWarehouse: (config: Omit<WarehouseConfig, "build">) =>
    createHybridWarehouseConfig({
      ...config,
      build: {
        target: "browser",
        sourcemap: true,
        minify: true,
        moduleSystem: createDefaultModuleSystemConfig({
          externals: {
            externals: {
              vue: {
                global: "Vue",
                esm: "vue",
                commonjs: "vue",
              },
            },
            strategy: "mixed",
          },
        }),
      },
    }),

  /**
   * Utility library warehouse
   */
  utilityWarehouse: (config: Omit<WarehouseConfig, "build">) =>
    createHybridWarehouseConfig({
      ...config,
      build: {
        target: "universal",
        sourcemap: true,
        minify: true,
        moduleSystem: createDefaultModuleSystemConfig({
          externals: {
            strategy: "import",
          },
        }),
      },
    }),

  /**
   * Modern web application host
   */
  modernWebHost: (config: Partial<HostConfig> = {}) =>
    createModernHostConfig(config),

  /**
   * Legacy web application host
   */
  legacyWebHost: (config: Partial<HostConfig> = {}) =>
    createLegacyHostConfig(config),

  /**
   * Node.js application host
   */
  nodeHost: (config: Partial<HostConfig> = {}) => createNodeHostConfig(config),
};

/**
 * Helper to migrate legacy configuration to new format
 */
export function migrateLegacyConfig(
  legacyConfig: any
): WarehouseConfig | HostConfig {
  // Detect if it's a warehouse or host config
  if (legacyConfig.expose) {
    // It's a warehouse config
    return createHybridWarehouseConfig({
      name: legacyConfig.name || "unknown",
      version: legacyConfig.version || "1.0.0",
      expose: legacyConfig.expose,
      dependencies: legacyConfig.dependencies,
      metadata: legacyConfig.metadata,
      build: {
        outDir: legacyConfig.outDir || legacyConfig.build?.outDir,
        publicPath: legacyConfig.publicPath || legacyConfig.build?.publicPath,
        sourcemap:
          legacyConfig.sourcemap ?? legacyConfig.build?.sourcemap ?? true,
        minify: legacyConfig.minify ?? legacyConfig.build?.minify ?? true,
        target:
          legacyConfig.target || legacyConfig.build?.target || "universal",
      },
    });
  } else if (legacyConfig.warehouses) {
    // It's a host config
    return createModernHostConfig({
      warehouses: legacyConfig.warehouses,
      catalog: legacyConfig.catalog,
      cache: legacyConfig.cache,
      loading: legacyConfig.loading,
    });
  } else {
    throw new Error("Unable to determine configuration type");
  }
}

/**
 * Validate configuration and provide helpful error messages
 */
export function validateConfiguration(config: WarehouseConfig | HostConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if it's a warehouse config
  if ("expose" in config) {
    const warehouseConfig = config as WarehouseConfig;

    if (!warehouseConfig.name) {
      errors.push("Warehouse name is required");
    }

    if (!warehouseConfig.version) {
      errors.push("Warehouse version is required");
    }

    if (
      !warehouseConfig.expose ||
      Object.keys(warehouseConfig.expose).length === 0
    ) {
      errors.push("At least one cargo must be exposed");
    }

    if (warehouseConfig.build?.format) {
      const formats = Array.isArray(warehouseConfig.build.format)
        ? warehouseConfig.build.format
        : [warehouseConfig.build.format];

      if (formats.length > 1 && !warehouseConfig.build.moduleSystem?.hybrid) {
        warnings.push("Multiple formats specified but hybrid mode is disabled");
      }
    }
  }

  // Check if it's a host config
  if ("warehouses" in config) {
    const hostConfig = config as HostConfig;

    if (
      !hostConfig.warehouses ||
      Object.keys(hostConfig.warehouses).length === 0
    ) {
      errors.push("At least one warehouse must be configured");
    }

    for (const [name, warehouse] of Object.entries(
      hostConfig.warehouses || {}
    )) {
      if (!warehouse.url) {
        errors.push(`Warehouse '${name}' is missing URL`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
