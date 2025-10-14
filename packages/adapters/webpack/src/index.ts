/**
 * Webpack Adapter for Expozr
 *
 * Provides webpack integration for building and serving Expozr remotes and hosts
 * with optimized UMD output format for maximum Navigator compatibility.
 */

export {
  WebpackAdapter,
  webpackAdapter,
  createExpozrPlugin,
  createHostPlugin,
  createHostWebpackConfig,
} from "./adapter";

// Export plugins
export { ExpozrPlugin } from "./plugins/expozr";
export { ExpozrHostPlugin } from "./plugins/host";

// Export plugin types
export type { ExpozrPluginOptions, HostPluginOptions } from "./plugins";

export { suppressExpozrWarnings } from "./utils";
