/**
 * Webpack plugins for Expozr ecosystem
 */

import { ExpozrPlugin } from "./expozr";
import { ExpozrHostPlugin } from "./host";

export { ExpozrPlugin, type ExpozrPluginOptions } from "./expozr";
export { ExpozrHostPlugin, type HostPluginOptions } from "./host";

// Convenience functions for plugin creation
export function createExpozrPlugin(
  options: import("./expozr").ExpozrPluginOptions = {}
) {
  return new ExpozrPlugin(options);
}

export function createHostPlugin(
  options: import("./host").HostPluginOptions = {}
) {
  return new ExpozrHostPlugin(options);
}
