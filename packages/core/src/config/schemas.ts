/**
 * JSON Schema definitions for configuration validation
 */

/**
 * Schema for validating expozr configuration
 */
export const expozrConfigSchema = {
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
        format: {
          oneOf: [
            {
              type: "string",
              enum: ["esm", "umd", "cjs", "amd", "iife", "system"],
            },
            {
              type: "array",
              items: {
                type: "string",
                enum: ["esm", "umd", "cjs", "amd", "iife", "system"],
              },
            },
          ],
        },
        moduleSystem: {
          type: "object",
          properties: {
            primary: {
              type: "string",
              enum: ["esm", "umd", "cjs", "amd", "iife", "system"],
            },
            fallbacks: {
              type: "array",
              items: {
                type: "string",
                enum: ["esm", "umd", "cjs", "amd", "iife", "system"],
              },
            },
            strategy: {
              type: "string",
              enum: ["dynamic", "static", "lazy", "eager"],
            },
            hybrid: { type: "boolean" },
          },
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
    expozrs: {
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
  required: ["expozrs"],
  additionalProperties: false,
};

/**
 * Schema for validating inventory structure
 */
export const inventorySchema = {
  type: "object",
  properties: {
    expozr: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+" },
        url: { type: "string", minLength: 1 },
        description: { type: "string" },
        author: { type: "string" },
      },
      required: ["name", "version", "url"],
      additionalProperties: false,
    },
    cargo: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+" },
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
              size: { type: "number", minimum: 0 },
              lastModified: { type: "number", minimum: 0 },
            },
            additionalProperties: false,
          },
        },
        required: ["name", "version", "entry"],
        additionalProperties: false,
      },
    },
    dependencies: {
      type: "object",
      additionalProperties: { type: "string" },
    },
    timestamp: { type: "number", minimum: 0 },
    checksum: { type: "string" },
  },
  required: ["expozr", "cargo", "timestamp"],
  additionalProperties: false,
};

/**
 * Schema for validating module system configuration
 */
export const moduleSystemConfigSchema = {
  type: "object",
  properties: {
    primary: {
      type: "string",
      enum: ["esm", "umd", "cjs", "amd", "iife", "system"],
    },
    fallbacks: {
      type: "array",
      items: {
        type: "string",
        enum: ["esm", "umd", "cjs", "amd", "iife", "system"],
      },
    },
    strategy: {
      type: "string",
      enum: ["dynamic", "static", "lazy", "eager"],
    },
    hybrid: { type: "boolean" },
    resolution: {
      type: "object",
      properties: {
        extensions: {
          type: "array",
          items: { type: "string" },
        },
        alias: {
          type: "object",
          additionalProperties: { type: "string" },
        },
        baseUrl: { type: "string" },
        paths: {
          type: "object",
          additionalProperties: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      additionalProperties: false,
    },
    externals: {
      type: "object",
      properties: {
        externals: {
          oneOf: [
            {
              type: "array",
              items: { type: "string" },
            },
            {
              type: "object",
              additionalProperties: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      global: { type: "string" },
                      commonjs: { type: "string" },
                      commonjs2: { type: "string" },
                      amd: { type: "string" },
                      esm: { type: "string" },
                      cdn: { type: "string" },
                    },
                    additionalProperties: false,
                  },
                ],
              },
            },
          ],
        },
        strategy: {
          type: "string",
          enum: ["cdn", "global", "import", "mixed"],
        },
        cdnUrl: { type: "string" },
      },
      additionalProperties: false,
    },
    compatibility: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: [
            "es5",
            "es6",
            "es2015",
            "es2017",
            "es2018",
            "es2019",
            "es2020",
            "es2021",
            "es2022",
            "esnext",
          ],
        },
        browsers: {
          type: "array",
          items: { type: "string" },
        },
        legacy: { type: "boolean" },
        polyfills: {
          type: "array",
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
  },
  required: ["primary"],
  additionalProperties: false,
};
