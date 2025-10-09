/**
 * Webpack utilities for Expozr ecosystem
 */

/**
 * Returns ignoreWarnings configuration to suppress common Expozr warnings
 * Use this in your webpack config for a cleaner development experience
 *
 * @example
 * ```javascript
 * const { suppressExpozrWarnings } = require('@expozr/webpack-adapter');
 *
 * module.exports = {
 *   // ... your config
 *   ignoreWarnings: suppressExpozrWarnings(),
 * };
 * ```
 */
export function suppressExpozrWarnings() {
  return [
    {
      // Navigator package dynamic imports
      module: /navigator\/dist\/index\.esm\.js/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
    {
      // Any @expozr package dynamic imports
      module: /@expozr\/.*\/dist\/.*\.js/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
    {
      // Core package dynamic imports
      module: /core\/dist\/index\.esm\.js/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
  ];
}

/**
 * Creates a complete webpack configuration optimized for Expozr host applications
 *
 * @param options - Configuration options
 * @returns Partial webpack configuration object
 *
 * @example
 * ```javascript
 * const { createHostConfig } = require('@expozr/webpack-adapter');
 *
 * module.exports = {
 *   ...createHostConfig(),
 *   entry: './src/index.tsx',
 *   // ... your custom config
 * };
 * ```
 */
export function createHostConfig(
  options: {
    suppressWarnings?: boolean;
  } = {}
) {
  const { suppressWarnings = true } = options;

  const config: any = {
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
  };

  if (suppressWarnings) {
    config.ignoreWarnings = suppressExpozrWarnings();
  }

  return config;
}

/**
 * Creates a complete webpack configuration optimized for Expozr warehouse applications
 *
 * ℹ️ Entries from expozr.config.ts are automatically populated by ExpozrWarehousePlugin.
 * You can optionally define additional entries in your webpack config - they will be merged
 * with custom entries taking precedence over auto-generated ones.
 *
 * @param options - Configuration options
 * @returns Partial webpack configuration object
 *
 * @example
 * ```javascript
 * const { createWarehouseConfig, createWarehousePlugin } = require('@expozr/webpack-adapter');
 *
 * module.exports = {
 *   ...createWarehouseConfig(),
 *   entry: {
 *     // Optional: custom entries (merged with expozr.config.ts entries)
 *     customEntry: './src/custom.ts'
 *   },
 *   plugins: [
 *     createWarehousePlugin(), // Auto-populates entries from expozr.config.ts
 *   ],
 *   // ... your custom config
 * };
 * ```
 */
export function createWarehouseConfig(
  options: {
    suppressWarnings?: boolean;
    extensions?: string[];
  } = { suppressWarnings: true, extensions: [".ts", ".tsx", ".js", ".jsx"] }
) {
  const { suppressWarnings, extensions } = options;

  const config: any = {
    resolve: {
      extensions,
    },
    externals: {
      react: {
        commonjs: "react",
        commonjs2: "react",
        amd: "react",
        root: "React",
      },
      "react-dom": {
        commonjs: "react-dom",
        commonjs2: "react-dom",
        amd: "react-dom",
        root: "ReactDOM",
      },
    },
  };

  if (suppressWarnings) {
    config.ignoreWarnings = suppressExpozrWarnings();
  }

  return config;
}
