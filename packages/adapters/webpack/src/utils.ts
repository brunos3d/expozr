/**
 * Webpack utilities for Expozr ecosystem
 */

import { createWebpackIgnoreWarnings } from "@expozr/adapter-sdk";

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
  return createWebpackIgnoreWarnings();
}
