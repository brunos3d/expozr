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
    {
      // React package dynamic imports
      module: /react\/dist\/index\.esm\.js/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
    {
      // All packages dynamic imports - broader pattern
      module: /packages\/.*\/dist\/.*\.js/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
  ];
}
