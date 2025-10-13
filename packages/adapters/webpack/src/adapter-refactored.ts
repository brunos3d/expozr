/**
 * Webpack adapter for Expozr ecosystem
 *
 * This adapter provides comprehensive webpack integration for Expozr warehouses and hosts,
 * supporting multiple module formats (ESM, UMD, CJS) and providing development-friendly
 * configurations.
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
//   createWebpackExternals,
//   createWebpackHostExternals,
//   createWebpackIgnoreWarnings,
//   getWebpackTargetConfig,
//   createWebpackFormatConfig,
//   shouldEnableWebpackOutputModule,
//   createMultiFormatWebpackConfigs,
// } from "@expozr/adapter-sdk";

/**
 * Webpack adapter implementation
 *
 * Features:
 * - Multiple module format support (ESM, UMD, CJS)
 * - TypeScript configuration optimization
 * - Warning suppression for better DX
 * - Development and production optimizations
 * - Inventory generation
 */
export class WebpackAdapter extends AbstractBundlerAdapter {
  readonly name = "webpack";

  get bundlerName(): string {
    return this.name;
  }

  get supportedVersions(): string[] {
    return ["^5.0.0"];
  }

  isAvailable(): boolean {
    try {
      require.resolve("webpack");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Configure webpack for Expozr warehouse builds
   */
  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any {
    this.validateExpozrConfig(config);

    const { build = {} } = config;
    const {
      format = ["umd"],
      moduleSystem,
      target = "universal",
      outDir = "dist",
      publicPath = "/",
      sourcemap = true,
      minify = false,
    } = build;

    // Ensure moduleSystem has required properties
    const defaultModuleSystem = {
      primary: "umd" as const,
      fallbacks: ["esm" as const],
      strategy: "dynamic" as const,
      hybrid: true,
      ...moduleSystem,
    };

    // Normalize formats
    const formats = Array.isArray(format) ? format : [format];
    const primaryFormat = formats[0];

    // Base webpack configuration
    const webpackConfig = {
      ...bundlerConfig,
      mode: minify ? "production" : "none",
      target: this.getWebpackTarget(target),
      devtool: sourcemap ? "source-map" : false,
      output: {
        ...bundlerConfig.output,
        path: outDir,
        publicPath,
        clean: true,
        ...this.getOutputConfigForFormat(primaryFormat),
      },
      externals: this.configureExternals(defaultModuleSystem, target),
      ignoreWarnings: [
        ...this.getIgnoreWarnings(),
        ...(bundlerConfig.ignoreWarnings || []),
      ],
      experiments: {
        ...bundlerConfig.experiments,
        outputModule: this.shouldEnableOutputModule(formats),
      },
      optimization: this.getOptimizationConfig(primaryFormat, minify),
    };

    // Handle multi-format builds
    if (formats.length > 1) {
      return this.createMultiFormatConfigs(
        formats,
        webpackConfig,
        defaultModuleSystem
      );
    }

    return webpackConfig;
  }

  /**
   * Configure webpack for Expozr host applications
   */
  configureHost(config: HostConfig, bundlerConfig: any): any {
    this.validateHostConfig(config);

    return {
      ...bundlerConfig,
      externals: this.createHostExternals(config),
      ignoreWarnings: [
        ...(bundlerConfig.ignoreWarnings || []),
        ...this.getIgnoreWarnings(),
      ],
      experiments: {
        ...bundlerConfig.experiments,
        dynamicImport: true,
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
   * Get default webpack configuration for Expozr projects
   */
  getDefaultConfig(): any {
    return {
      mode: "development",
      entry: "./src/index.ts",
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
      },
      experiments: {
        outputModule: false, // Default to UMD for compatibility
      },
    };
  }

  /**
   * Create format-specific webpack configuration
   */
  protected createFormatConfig(
    format: ModuleFormat,
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any {
    const baseConfig = { ...bundlerConfig };

    switch (format) {
      case "esm":
        return {
          ...baseConfig,
          experiments: {
            ...baseConfig.experiments,
            outputModule: true,
          },
          output: {
            ...baseConfig.output,
            filename: "[name].mjs",
            chunkFilename: "[name]-[contenthash].mjs",
            library: {
              type: "module",
            },
            module: true,
            environment: {
              module: true,
              dynamicImport: true,
              arrowFunction: true,
            },
          },
        };

      case "umd":
        return {
          ...baseConfig,
          output: {
            ...baseConfig.output,
            filename: "[name].umd.js",
            chunkFilename: "[name]-[contenthash].umd.js",
            library: {
              name: "[name]",
              type: "umd",
              export: "default",
            },
            globalObject: "typeof self !== 'undefined' ? self : this",
            umdNamedDefine: true,
          },
        };

      case "cjs":
        return {
          ...baseConfig,
          target: "node",
          output: {
            ...baseConfig.output,
            filename: "[name].cjs",
            chunkFilename: "[name]-[contenthash].cjs",
            library: {
              type: "commonjs2",
            },
          },
        };

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Get webpack target based on environment
   */
  private getWebpackTarget(target: string): string {
    switch (target) {
      case "node":
        return "node";
      case "web":
      case "universal":
      default:
        return "web";
    }
  }

  /**
   * Get output configuration for a specific format
   */
  private getOutputConfigForFormat(format: ModuleFormat): any {
    switch (format) {
      case "esm":
        return {
          filename: "[name].mjs",
          chunkFilename: "[name]-[contenthash].mjs",
          library: {
            type: "module",
          },
          module: true,
          environment: {
            module: true,
            dynamicImport: true,
            arrowFunction: true,
          },
        };

      case "umd":
        return {
          filename: "[name].umd.js",
          chunkFilename: "[name]-[contenthash].umd.js",
          library: {
            name: "[name]",
            type: "umd",
            export: "default",
          },
          globalObject: "typeof self !== 'undefined' ? self : this",
          umdNamedDefine: true,
        };

      case "cjs":
        return {
          filename: "[name].cjs",
          chunkFilename: "[name]-[contenthash].cjs",
          library: {
            type: "commonjs2",
          },
        };

      default:
        return {
          filename: "[name].js",
          library: {
            type: "umd",
            name: "[name]",
            export: "default",
          },
        };
    }
  }

  /**
   * Determine if output module should be enabled
   */
  private shouldEnableOutputModule(formats: ModuleFormat[]): boolean {
    return formats.includes("esm");
  }

  /**
   * Get optimization configuration for format
   */
  private getOptimizationConfig(format: ModuleFormat, minify: boolean): any {
    const baseOptimization = {
      minimize: minify,
    };

    if (format === "esm") {
      return {
        ...baseOptimization,
        usedExports: true,
        providedExports: true,
        sideEffects: false,
      };
    }

    // UMD/CJS optimizations (minimal to avoid breaking format)
    return {
      ...baseOptimization,
      concatenateModules: false,
      splitChunks: false,
      runtimeChunk: false,
    };
  }

  /**
   * Create multiple webpack configurations for multi-format builds
   */
  private createMultiFormatConfigs(
    formats: ModuleFormat[],
    baseConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any[] {
    return formats.map((format) =>
      this.createFormatConfig(format, baseConfig, moduleSystem)
    );
  }

  /**
   * Create externals configuration for warehouse builds
   */
  configureExternals(moduleSystem: ModuleSystemConfig, target?: string): any {
    const targetEnv = target || "universal";

    // Common externals for web targets
    if (targetEnv === "web" || targetEnv === "universal") {
      return {
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
      };
    }

    return {};
  }

  /**
   * Create externals for host applications
   */
  private createHostExternals(config: HostConfig): Record<string, string> {
    const externals: Record<string, string> = {};

    // Create external entries for warehouse modules
    for (const [warehouseName, warehouseRef] of Object.entries(
      config.expozrs
    )) {
      const ref = warehouseRef as any;
      const alias = ref.alias || warehouseName;
      externals[`@expozr/expozr/${alias}`] = `expozr-expozr-${alias}`;
    }

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
   * Get warning suppressions for Expozr projects
   */
  getIgnoreWarnings(): Array<(warning: Error) => boolean> {
    return [
      (warning: Error) => {
        const message = warning.message;
        return (
          message.includes(
            "Critical dependency: the request of a dependency is an expression"
          ) &&
          (message.includes("navigator/dist/index.esm.js") ||
            message.includes("@expozr/") ||
            message.includes("packages/"))
        );
      },
    ];
  }

  /**
   * Create Expozr plugin instance
   */
  createExpozrPlugin(config: ExpozrConfig): any {
    const { ExpozrPlugin } = require("./expozr-plugin-refactored");
    return new ExpozrPlugin({ config });
  }

  /**
   * Create Host plugin instance
   */
  createHostPlugin(config: HostConfig): any {
    const { ExpozrHostPlugin } = require("./host-plugin-refactored");
    return new ExpozrHostPlugin({ config });
  }

  /**
   * Generate inventory using the core generator
   */
  async generateInventory(config: ExpozrConfig): Promise<any> {
    const { InventoryGenerator } = await import("@expozr/core");
    return await InventoryGenerator.generate(config);
  }
}

// Create singleton instance
export const webpackAdapter = new WebpackAdapter();

// Export plugins for direct use (using refactored versions)
export { ExpozrPlugin } from "./expozr-plugin-refactored";
export { ExpozrHostPlugin } from "./host-plugin-refactored";

// Export convenience functions
export function createExpozrPlugin(options?: any) {
  const { ExpozrPlugin } = require("./expozr-plugin-refactored");
  return new ExpozrPlugin(options);
}

export function createHostPlugin(options?: any) {
  const { ExpozrHostPlugin } = require("./host-plugin-refactored");
  return new ExpozrHostPlugin(options);
}

/**
 * Creates a webpack configuration optimized for Expozr host applications
 */
export function createHostWebpackConfig(customConfig: any = {}) {
  return {
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      ...customConfig.resolve,
    },
    ignoreWarnings: [
      ...(customConfig.ignoreWarnings || []),
      ...webpackAdapter.getIgnoreWarnings(),
    ],
    experiments: {
      dynamicImport: true,
      ...customConfig.experiments,
    },
    ...customConfig,
  };
}
