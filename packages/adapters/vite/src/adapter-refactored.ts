/**
 * Vite adapter for Expozr ecosystem
 *
 * This adapter provides comprehensive Vite integration for Expozr warehouses and hosts,
 * supporting multiple module formats and providing development-friendly configurations.
 */

import {
  AbstractBundlerAdapter,
  type ExpozrConfig,
  type HostConfig,
  type ModuleFormat,
  type ModuleSystemConfig,
} from "@expozr/core";

// Import utilities from the shared SDK (will be enabled after SDK is built)
// import {
//   createViteExternals,
//   createViteHostExternals,
//   createViteWarningFilter,
//   createViteFormatConfig,
//   normalizeFormats,
//   createMultiFormatViteConfigs,
// } from "@expozr/adapter-sdk";

/**
 * Vite adapter implementation
 *
 * Features:
 * - Multiple module format support (ESM, UMD, CJS)
 * - Library mode configuration
 * - External dependency management
 * - Warning suppression for better DX
 * - Development server configuration
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

  /**
   * Configure Vite for Expozr warehouse builds
   */
  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any {
    this.validateExpozrConfig(config);

    const { build = {} } = config;
    const {
      format = ["es"],
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

    // Normalize formats for Vite
    const normalizedFormats = Array.isArray(format) ? format : [format];
    const formats = this.normalizeViteFormats(
      normalizedFormats as ModuleFormat[]
    );

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
          formats,
          name: config.name,
          fileName: (format: string) => this.getFileNamePattern(format),
        },
        rollupOptions: {
          ...bundlerConfig.build?.rollupOptions,
          external: this.configureExternals(defaultModuleSystem, target),
          output: this.createOutputConfig(formats, config, defaultModuleSystem),
          onwarn: this.createWarningFilter(),
        },
      },
      base: publicPath,
    };

    return viteConfig;
  }

  /**
   * Configure Vite for Expozr host applications
   */
  configureHost(config: HostConfig, bundlerConfig: any): any {
    this.validateHostConfig(config);

    return {
      ...bundlerConfig,
      build: {
        ...bundlerConfig.build,
        rollupOptions: {
          ...bundlerConfig.build?.rollupOptions,
          external: this.createHostExternals(config),
        },
      },
      resolve: {
        ...bundlerConfig.resolve,
        alias: {
          ...bundlerConfig.resolve?.alias,
          ...this.createWarehouseAliases(config),
        },
      },
    };
  }

  /**
   * Get default Vite configuration for Expozr projects
   */
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

  /**
   * Create format-specific configuration for Vite
   */
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
        return {
          format: "es",
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name]-[hash].mjs",
        };
    }
  }

  /**
   * Create entry points from Expozr configuration
   */
  private createEntryPoints(config: ExpozrConfig): Record<string, string> {
    const entries: Record<string, string> = {};

    for (const [name, cargoConfig] of Object.entries(config.expose)) {
      const entry =
        typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;
      const cleanName = name.startsWith("./") ? name.slice(2) : name;
      entries[cleanName] = entry;
    }

    return entries;
  }

  /**
   * Normalize module formats for Vite
   */
  private normalizeViteFormats(formats: ModuleFormat[]): string[] {
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

  /**
   * Get file name pattern for a format
   */
  private getFileNamePattern(format: string): string {
    switch (format) {
      case "es":
        return "[name].mjs";
      case "umd":
        return "[name].umd.js";
      case "cjs":
        return "[name].cjs";
      default:
        return "[name].js";
    }
  }

  /**
   * Create output configuration for multiple formats
   */
  private createOutputConfig(
    formats: string[],
    config: ExpozrConfig,
    moduleSystem: ModuleSystemConfig
  ): any {
    if (formats.length === 1) {
      return this.createSingleFormatOutput(formats[0]);
    }

    // Multiple formats
    return formats.map((format) => this.createSingleFormatOutput(format));
  }

  /**
   * Create output configuration for a single format
   */
  private createSingleFormatOutput(format: string): any {
    switch (format) {
      case "es":
        return {
          format: "es",
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name]-[hash].mjs",
        };

      case "umd":
        return {
          format: "umd",
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
        return {
          format: "es",
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name]-[hash].mjs",
        };
    }
  }

  /**
   * Configure externals for warehouse builds
   */
  configureExternals(
    moduleSystem: ModuleSystemConfig,
    target?: string
  ): string[] {
    const externals: string[] = [];

    // Add common externals based on target
    const targetEnv = target || "universal";
    if (targetEnv === "web" || targetEnv === "universal") {
      externals.push("react", "react-dom", "react/jsx-runtime");
    }

    return externals;
  }

  /**
   * Create externals for host applications
   */
  private createHostExternals(config: HostConfig): string[] {
    const externals: string[] = [];

    // Add warehouse module patterns
    for (const [warehouseName, warehouseRef] of Object.entries(
      config.expozrs
    )) {
      const ref = warehouseRef as any;
      const alias = ref.alias || warehouseName;
      externals.push(`@expozr/expozr/${alias}`);
    }

    // Add common externals
    externals.push("react", "react-dom", "react/jsx-runtime");

    return externals;
  }

  /**
   * Create aliases for warehouse modules in host applications
   */
  private createWarehouseAliases(config: HostConfig): Record<string, string> {
    const aliases: Record<string, string> = {};

    for (const [warehouseName, warehouseRef] of Object.entries(
      config.expozrs
    )) {
      const ref = warehouseRef as any;
      const alias = ref.alias || warehouseName;

      aliases[`@warehouse/${alias}`] = `@expozr/expozr/${alias}`;
      aliases[`@wh/${alias}`] = `@expozr/expozr/${alias}`;
    }

    return aliases;
  }

  /**
   * Create warning filter for better developer experience
   */
  private createWarningFilter(): (warning: any) => boolean {
    return (warning: any) => {
      const { message, id } = warning;

      // Suppress common Expozr-related warnings
      if (message && message.includes("@expozr/")) {
        return false;
      }

      if (id && id.includes("navigator/dist/index.esm.js")) {
        return false;
      }

      return true; // Keep other warnings
    };
  }
}

// Create singleton instance
export const viteAdapter = new ViteAdapter();
