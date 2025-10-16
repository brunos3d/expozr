/**
 * Webpack adapter for Expozr ecosystem
 *
 * This adapter provides comprehensive webpack integration for Expozr remotes and hosts,
 * supporting UMD output format for maximum compatibility with the Navigator system.
 */

import type {
  ExpozrConfig,
  HostConfig,
  ModuleFormat,
  ModuleSystemConfig,
} from "@expozr/core";
import { AbstractBundlerAdapter, InventoryGenerator } from "@expozr/core";
import {
  DEFAULT_EXPOZR_PLUGIN_OPTIONS,
  ExpozrPlugin,
  type ExpozrPluginOptions,
} from "./plugins/expozr";
import { ExpozrHostPlugin } from "./plugins/host";

/**
 * Webpack adapter implementation
 *
 * Features:
 * - UMD module format for Navigator compatibility
 * - TypeScript configuration optimization
 * - Development server CORS setup
 * - Inventory generation
 * - Warning suppression for better DX
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
   * Configure webpack for Expozr remote builds
   */
  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any {
    this.validateExpozrConfig(config);

    const { build = {} } = config;
    const {
      format = ["umd"], // Default to UMD for Navigator compatibility
      outDir = "dist",
      publicPath = "/",
      sourcemap = true,
      minify = false,
    } = build;

    // Base webpack configuration optimized for Expozr
    const webpackConfig = {
      ...bundlerConfig,
      mode: minify ? "production" : "development",
      devtool: sourcemap ? "source-map" : false,
      target: "web",

      output: {
        ...bundlerConfig.output,
        path: outDir,
        publicPath,
        filename: "[name].js",
        library: {
          name: "[name]",
          type: "umd",
          export: "default",
        },
        globalObject: "typeof self !== 'undefined' ? self : this",
        clean: true,
      },

      plugins: [...(bundlerConfig.plugins || []), new ExpozrPlugin({ config })],

      experiments: {
        ...bundlerConfig.experiments,
        outputModule: false, // Disable for UMD compatibility
      },

      optimization: {
        ...bundlerConfig.optimization,
        minimize: minify,
        // Disable optimizations that break UMD
        concatenateModules: false,
        usedExports: false,
        sideEffects: false,
        splitChunks: false,
        runtimeChunk: false,
      },

      devServer: {
        ...bundlerConfig.devServer,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          ...bundlerConfig.devServer?.headers,
        },
      },
    };

    return webpackConfig;
  }

  /**
   * Configure webpack for Expozr host applications
   */
  configureHost(config: HostConfig, bundlerConfig: any): any {
    this.validateHostConfig(config);

    return {
      ...bundlerConfig,
      plugins: [
        ...(bundlerConfig.plugins || []),
        new ExpozrHostPlugin({ config }),
      ],
      experiments: {
        ...bundlerConfig.experiments,
        dynamicImport: true,
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
      target: "web",
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
      devServer: {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    };
  }

  /**
   * Create format-specific configuration (UMD focus)
   */
  protected createFormatConfig(
    format: ModuleFormat,
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any {
    // Webpack adapter focuses on UMD for Navigator compatibility
    if (format === "umd") {
      return {
        output: {
          filename: "[name].js",
          library: {
            name: "[name]",
            type: "umd",
            export: "default",
          },
          globalObject: "typeof self !== 'undefined' ? self : this",
        },
      };
    }

    // ESM support (experimental)
    if (format === "esm") {
      return {
        output: {
          filename: "[name].mjs",
          library: {
            type: "module",
          },
        },
        experiments: {
          outputModule: true,
        },
      };
    }

    // Default to UMD
    return this.createFormatConfig("umd", bundlerConfig, moduleSystem);
  }

  /**
   * Create Expozr plugin instance
   */
  createExpozrPlugin(config: ExpozrConfig): ExpozrPlugin {
    return new ExpozrPlugin({ config });
  }

  /**
   * Create Host plugin instance
   */
  createHostPlugin(config: HostConfig): ExpozrHostPlugin {
    return new ExpozrHostPlugin({ config });
  }

  /**
   * Generate inventory using core generator
   */
  async generateInventory(config: ExpozrConfig): Promise<any> {
    return InventoryGenerator.generate(config);
  }

  /**
   * Get warning suppressions for better DX
   */
  getIgnoreWarnings(): Array<(warning: Error) => boolean> {
    return [
      // Suppress Navigator dynamic import warnings
      (warning: any) => {
        return (
          warning.message &&
          warning.message.includes(
            "Critical dependency: the request of a dependency is an expression"
          )
        );
      },
      // Suppress module not found warnings for externals
      (warning: any) => {
        return (
          warning.message &&
          warning.message.includes("Module not found") &&
          (warning.message.includes("@expozr/") ||
            warning.message.includes("expozr-"))
        );
      },
    ];
  }
}

// Create singleton instance
export const webpackAdapter = new WebpackAdapter();

// Export convenience functions
export function createExpozrPlugin(
  options: ExpozrPluginOptions = DEFAULT_EXPOZR_PLUGIN_OPTIONS
) {
  return new ExpozrPlugin(options);
}

export function createHostPlugin(options?: any) {
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
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      ...customConfig.devServer,
    },
    ...customConfig,
  };
}
