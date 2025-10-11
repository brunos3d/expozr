/**
 * Vite adapter for Expozr ecosystem
 */

import {
  AbstractBundlerAdapter,
  type ExpozrConfig,
  type HostConfig,
  type ModuleFormat,
  type ModuleSystemConfig,
} from "@expozr/core";

/**
 * Vite adapter implementation
 */
export class ViteAdapter extends AbstractBundlerAdapter {
  readonly name = "vite";

  get bundlerName(): string {
    return this.name;
  }

  get supportedVersions(): string[] {
    return ["^4.0.0", "^5.0.0"];
  }

  isAvailable(): boolean {
    try {
      require.resolve("vite");
      return true;
    } catch {
      return false;
    }
  }

  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any {
    this.validateExpozrConfig(config);

    const { build = {} } = config;
    const {
      format = ["esm"],
      moduleSystem,
      target = "universal",
      outDir = "dist",
      publicPath = "/",
      sourcemap = true,
      minify = true,
    } = build;

    // Ensure moduleSystem has required properties
    const defaultModuleSystem = {
      primary: "esm" as const,
      fallbacks: ["umd" as const],
      strategy: "dynamic" as const,
      hybrid: false, // Vite primarily focuses on ESM
      ...moduleSystem,
    };

    // Base Vite configuration
    const viteConfig = {
      ...bundlerConfig,
      build: {
        ...bundlerConfig.build,
        outDir,
        sourcemap,
        minify,
        lib: {
          entry: this.createEntryPoints(config),
          formats: this.normalizeFormats(format),
        },
        rollupOptions: {
          ...bundlerConfig.build?.rollupOptions,
          external: this.configureExternals(defaultModuleSystem, target),
          output: this.createOutputConfig(format, config, defaultModuleSystem),
        },
      },
      base: publicPath,
    };

    return viteConfig;
  }

  configureHost(config: HostConfig, bundlerConfig: any): any {
    this.validateHostConfig(config);

    // Host configuration for Vite
    return {
      ...bundlerConfig,
      build: {
        ...bundlerConfig.build,
        rollupOptions: {
          ...bundlerConfig.build?.rollupOptions,
          external: this.createHostExternals(config),
        },
      },
    };
  }

  getDefaultConfig(): any {
    return {
      plugins: [],
      build: {
        lib: {
          entry: "./src/index.ts",
          formats: ["es"],
        },
        rollupOptions: {
          external: ["react", "react-dom"],
        },
      },
    };
  }

  protected createFormatConfig(
    format: ModuleFormat,
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any {
    switch (format) {
      case "esm":
        return {
          format: "es",
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name]-[hash].mjs",
        };

      case "umd":
        return {
          format: "umd",
          name: "[name]",
          entryFileNames: "[name].umd.js",
          chunkFileNames: "[name]-[hash].umd.js",
        };

      case "cjs":
        return {
          format: "cjs",
          entryFileNames: "[name].cjs",
          chunkFileNames: "[name]-[hash].cjs",
        };

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private createEntryPoints(config: ExpozrConfig): Record<string, string> {
    const entries: Record<string, string> = {};

    for (const [name, cargoConfig] of Object.entries(config.expose)) {
      const entry =
        typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;
      entries[name.replace("./", "")] = entry;
    }

    return entries;
  }

  private normalizeFormats(format: ModuleFormat | ModuleFormat[]): string[] {
    const formats = Array.isArray(format) ? format : [format];
    return formats.map((f) => {
      switch (f) {
        case "esm":
          return "es";
        case "umd":
          return "umd";
        case "cjs":
          return "cjs";
        default:
          return "es";
      }
    });
  }

  private createOutputConfig(
    format: ModuleFormat | ModuleFormat[],
    config: ExpozrConfig,
    moduleSystem: ModuleSystemConfig
  ): any {
    const formats = Array.isArray(format) ? format : [format];

    if (formats.length === 1) {
      return this.createFormatConfig(formats[0], {}, moduleSystem);
    }

    // Multiple formats
    return formats.map((fmt) => this.createFormatConfig(fmt, {}, moduleSystem));
  }

  private createHostExternals(config: HostConfig): string[] {
    const externals: string[] = [];

    // Add common React externals for host apps
    externals.push("react", "react-dom");

    return externals;
  }
}

// Create singleton instance
export const viteAdapter = new ViteAdapter();
