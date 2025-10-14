/**
 * Vite plugin for Expozr hosts - Clean implementation
 */

import type { Plugin } from "vite";
import type { HostConfig } from "@expozr/core";
import { createViteHostExternals } from "@expozr/adapter-sdk";

export interface HostPluginOptions {
  hostConfig: HostConfig;
  development?: boolean;
}

export function expozrHost(options: HostPluginOptions): Plugin {
  const { hostConfig, development = true } = options;

  return {
    name: "expozr:host",

    config(viteConfig) {
      if (!hostConfig.expozrs) {
        console.warn("[expozr:host] No expozrs configured in host config");
        return;
      }

      // Setup aliases for expozr modules
      const aliases: Record<string, string> = {};
      for (const [name, expozrConfig] of Object.entries(hostConfig.expozrs)) {
        if (typeof expozrConfig === "object" && expozrConfig.alias) {
          aliases[`@expozr/${expozrConfig.alias}`] = `@expozr/expozr/${name}`;
        } else {
          aliases[`@expozr/${name}`] = `@expozr/expozr/${name}`;
        }
      }

      if (!viteConfig.resolve) {
        viteConfig.resolve = {};
      }

      viteConfig.resolve.alias = {
        ...viteConfig.resolve.alias,
        ...aliases,
      };

      // Configure externals for build
      const externals = createViteHostExternals(hostConfig);

      if (!viteConfig.build) {
        viteConfig.build = {};
      }

      if (!viteConfig.build.rollupOptions) {
        viteConfig.build.rollupOptions = {};
      }

      viteConfig.build.rollupOptions.external = externals;

      console.info(
        `[expozr:host] Configured ${Object.keys(hostConfig.expozrs).length} expozr aliases`
      );
    },
  };
}
