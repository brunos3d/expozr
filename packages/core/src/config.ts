/**
 * Configuration helpers and schema definitions
 */

import type {
  WarehouseConfig,
  HostConfig,
  CargoConfig,
  WarehouseMetadata,
} from "./types";

/**
 * Helper to define warehouse configuration with type safety
 */
export function defineWarehouseConfig(
  config: WarehouseConfig
): WarehouseConfig {
  return config;
}

/**
 * Helper to define host configuration with type safety
 */
export function defineHostConfig(config: HostConfig): HostConfig {
  return config;
}

/**
 * Helper to define cargo configuration with type safety
 */
export function defineCargoConfig(config: CargoConfig): CargoConfig {
  return config;
}

/**
 * Default warehouse configuration
 */
export const defaultWarehouseConfig: Partial<WarehouseConfig> = {
  build: {
    outDir: "dist",
    publicPath: "/",
    sourcemap: true,
    minify: true,
    target: "universal",
  },
  metadata: {
    license: "MIT",
  },
};

/**
 * Default host configuration
 */
export const defaultHostConfig: Partial<HostConfig> = {
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
  warehouses: {},
};

/**
 * Schema for validating warehouse configuration
 */
export const warehouseConfigSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+" },
    expose: {
      type: "object",
      additionalProperties: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              entry: { type: "string", minLength: 1 },
              exports: {
                type: "array",
                items: { type: "string" },
              },
              dependencies: {
                type: "object",
                additionalProperties: { type: "string" },
              },
              metadata: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  author: { type: "string" },
                  license: { type: "string" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
            required: ["entry"],
            additionalProperties: false,
          },
        ],
      },
    },
    dependencies: {
      type: "object",
      additionalProperties: { type: "string" },
    },
    metadata: {
      type: "object",
      properties: {
        description: { type: "string" },
        author: { type: "string" },
        license: { type: "string" },
        homepage: { type: "string" },
        repository: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
    build: {
      type: "object",
      properties: {
        outDir: { type: "string" },
        publicPath: { type: "string" },
        sourcemap: { type: "boolean" },
        minify: { type: "boolean" },
        target: {
          type: "string",
          enum: ["browser", "node", "universal"],
        },
      },
      additionalProperties: false,
    },
  },
  required: ["name", "version", "expose"],
  additionalProperties: false,
};

/**
 * Schema for validating host configuration
 */
export const hostConfigSchema = {
  type: "object",
  properties: {
    warehouses: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          url: { type: "string", minLength: 1 },
          version: { type: "string" },
          alias: { type: "string" },
          fallback: { type: "string" },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
    catalog: {
      oneOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            url: { type: "string", minLength: 1 },
            refreshInterval: { type: "number", minimum: 0 },
            cache: { type: "boolean" },
          },
          required: ["url"],
          additionalProperties: false,
        },
      ],
    },
    cache: {
      type: "object",
      properties: {
        strategy: {
          type: "string",
          enum: ["memory", "localStorage", "indexedDB", "none"],
        },
        ttl: { type: "number", minimum: 0 },
        maxSize: { type: "number", minimum: 0 },
        persist: { type: "boolean" },
      },
      required: ["strategy"],
      additionalProperties: false,
    },
    loading: {
      type: "object",
      properties: {
        timeout: { type: "number", minimum: 0 },
        retry: {
          type: "object",
          properties: {
            attempts: { type: "number", minimum: 0 },
            delay: { type: "number", minimum: 0 },
            backoff: { type: "number", minimum: 1 },
          },
          required: ["attempts", "delay"],
          additionalProperties: false,
        },
        preload: {
          type: "object",
          properties: {
            enabled: { type: "boolean" },
            include: {
              type: "array",
              items: { type: "string" },
            },
            exclude: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["enabled"],
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  required: ["warehouses"],
  additionalProperties: false,
};
