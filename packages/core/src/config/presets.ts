/**
 * Preset configurations for common use cases
 */

import type { ExpozrConfig, HostConfig } from "../types";
import {
  defineExpozrConfig,
  defineHostConfig,
  createModuleSystemDefaults,
} from "./base-config";

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
      moduleSystem: createModuleSystemDefaults({
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
      moduleSystem: createModuleSystemDefaults({
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
      moduleSystem: createModuleSystemDefaults({
        primary: "esm",
        fallbacks: ["umd"],
        strategy: "dynamic",
        hybrid: true,
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
      timeout: 45000, // Longer timeout for slower environments
      retry: {
        attempts: 5,
        delay: 2000,
        backoff: 1.5,
      },
      preload: {
        enabled: false, // Disable preloading for legacy
      },
      ...config.loading,
    },
    cache: {
      strategy: "localStorage", // More compatible than indexedDB
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
      timeout: 15000, // Faster in Node.js
      retry: {
        attempts: 3,
        delay: 500,
        backoff: 2,
      },
      preload: {
        enabled: false, // Usually not needed in Node.js
      },
      ...config.loading,
    },
    cache: {
      strategy: "memory", // Simple memory cache for Node.js
      ttl: 60 * 60 * 1000, // 1 hour
      persist: false,
      ...config.cache,
    },
  });
}

/**
 * Predefined configuration presets
 */
export const presets = {
  /**
   * React expozr preset with optimized externals
   */
  reactExpozr: (config: Omit<ExpozrConfig, "build">) =>
    createHybridExpozrConfig({
      ...config,
      build: {
        target: "browser",
        sourcemap: true,
        minify: true,
        moduleSystem: createModuleSystemDefaults({
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
   * Vue expozr preset with optimized externals
   */
  vueExpozr: (config: Omit<ExpozrConfig, "build">) =>
    createHybridExpozrConfig({
      ...config,
      build: {
        target: "browser",
        sourcemap: true,
        minify: true,
        moduleSystem: createModuleSystemDefaults({
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
   * Utility library expozr preset
   */
  utilityExpozr: (config: Omit<ExpozrConfig, "build">) =>
    createHybridExpozrConfig({
      ...config,
      build: {
        target: "universal",
        sourcemap: true,
        minify: true,
        moduleSystem: createModuleSystemDefaults({
          externals: {
            strategy: "import",
          },
        }),
      },
    }),

  /**
   * Modern web host preset
   */
  modernWebHost: (config: Partial<HostConfig> = {}) =>
    createModernHostConfig(config),

  /**
   * Legacy web host preset
   */
  legacyWebHost: (config: Partial<HostConfig> = {}) =>
    createLegacyHostConfig(config),

  /**
   * Node.js host preset
   */
  nodeHost: (config: Partial<HostConfig> = {}) => createNodeHostConfig(config),
};
