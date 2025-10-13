/**
 * Configuration utilities for the universal module system
 */

import type {
  ExpozrConfig,
  HostConfig,
  ModuleSystemConfig,
  ModuleFormat,
} from "./types";

import { defineExpozrConfig, defineHostConfig } from "./config";

import { createDefaultModuleSystemConfig } from "./module-system";

/**
 * Create ESM-only expozr configuration
 */
export function createESMExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  }
): ExpozrConfig {
  return defineExpozrConfig({
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
 * Create UMD-only expozr configuration
 */
export function createUMDExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  }
): ExpozrConfig {
  return defineExpozrConfig({
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
 * Create hybrid expozr configuration (both ESM and UMD)
 */
export function createHybridExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  }
): ExpozrConfig {
  return defineExpozrConfig({
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
 * Create expozr configuration with custom formats
 */
export function createCustomExpozrConfig(
  config: Omit<ExpozrConfig, "build"> & {
    build?: Partial<ExpozrConfig["build"]>;
  },
  formats: ModuleFormat[],
  moduleSystemConfig?: Partial<ModuleSystemConfig>
): ExpozrConfig {
  return defineExpozrConfig({
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
    expozrs: {},
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
    expozrs: {},
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
    expozrs: {},
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
   * React component library expozr
   */
  reactExpozr: (config: Omit<ExpozrConfig, "build">) =>
    createHybridExpozrConfig({
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
   * Vue component library expozr
   */
  vueExpozr: (config: Omit<ExpozrConfig, "build">) =>
    createHybridExpozrConfig({
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
   * Utility library expozr
   */
  utilityExpozr: (config: Omit<ExpozrConfig, "build">) =>
    createHybridExpozrConfig({
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
): ExpozrConfig | HostConfig {
  // Detect if it's a expozr or host config
  if (legacyConfig.expose) {
    // It's a expozr config
    return createHybridExpozrConfig({
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
  } else if (legacyConfig.expozrs) {
    // It's a host config
    return createModernHostConfig({
      expozrs: legacyConfig.expozrs,
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
export function validateConfiguration(config: ExpozrConfig | HostConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if it's a expozr config
  if ("expose" in config) {
    const expozrConfig = config as ExpozrConfig;

    if (!expozrConfig.name) {
      errors.push("Expozr name is required");
    }

    if (!expozrConfig.version) {
      errors.push("Expozr version is required");
    }

    if (!expozrConfig.expose || Object.keys(expozrConfig.expose).length === 0) {
      errors.push("At least one cargo must be exposed");
    }

    if (expozrConfig.build?.format) {
      const formats = Array.isArray(expozrConfig.build.format)
        ? expozrConfig.build.format
        : [expozrConfig.build.format];

      if (formats.length > 1 && !expozrConfig.build.moduleSystem?.hybrid) {
        warnings.push("Multiple formats specified but hybrid mode is disabled");
      }
    }
  }

  // Check if it's a host config
  if ("expozrs" in config) {
    const hostConfig = config as HostConfig;

    if (!hostConfig.expozrs || Object.keys(hostConfig.expozrs).length === 0) {
      errors.push("At least one expozr must be configured");
    }

    for (const [name, expozr] of Object.entries(hostConfig.expozrs || {})) {
      if (!expozr.url) {
        errors.push(`Expozr '${name}' is missing URL`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
