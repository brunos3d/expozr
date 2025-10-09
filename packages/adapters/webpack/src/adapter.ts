/**
 * Webpack adapter for Expozr ecosystem
 */

import { ExpozrAdapter } from "@expozr/core";
import type { WarehouseConfig, HostConfig, Inventory } from "@expozr/core";

import { ExpozrWarehousePlugin } from "./warehouse-plugin";
import { ExpozrHostPlugin } from "./host-plugin";

/**
 * Webpack adapter implementation
 */
export class WebpackAdapter extends ExpozrAdapter {
  get bundlerName(): string {
    return "webpack";
  }

  get supportedVersions(): string[] {
    return ["^5.0.0"];
  }

  createWarehousePlugin(config: WarehouseConfig): ExpozrWarehousePlugin {
    return new ExpozrWarehousePlugin({ config });
  }

  createHostPlugin(config: HostConfig): ExpozrHostPlugin {
    return new ExpozrHostPlugin({ config });
  }

  async generateInventory(config: WarehouseConfig): Promise<Inventory> {
    // This would be used in build tools or CLI
    // For now, throw as this is typically handled by the webpack plugin
    throw new Error(
      "generateInventory should be called through webpack plugin"
    );
  }
}

// Create default instance
export const webpackAdapter = new WebpackAdapter();

// Export plugins for direct use
export { ExpozrWarehousePlugin, ExpozrHostPlugin };

// Export convenience functions
export function createWarehousePlugin(options?: any) {
  return new ExpozrWarehousePlugin(options);
}

export function createHostPlugin(options?: any) {
  return new ExpozrHostPlugin(options);
}
