/**
 * Webpack adapter for Expozr ecosystem
 */

import {
  AbstractBundlerAdapter,
  BundlerUtils,
  type ExpozrConfig,
  type HostConfig,
  type Inventory,
  type ModuleFormat,
  type ModuleSystemConfig,
} from "@expozr/core";

import { ExpozrPlugin } from "./expozr-plugin";
import { ExpozrHostPlugin } from "./host-plugin";
import { suppressExpozrWarnings } from "./utils";

/**
 * Webpack adapter implementation
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

  configureExpozr(config: ExpozrConfig, bundlerConfig: any): any {
    this.validateExpozrConfig(config);

    const { build = {} } = config;
    const {
      format = ["esm", "umd"],
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
      hybrid: true,
      ...moduleSystem,
    };

    // Base webpack configuration
    const webpackConfig = {
      ...bundlerConfig,
      mode: minify ? "production" : "development",
      devtool: sourcemap ? "source-map" : false,
      output: {
        ...bundlerConfig.output,
        path: outDir,
        publicPath,
        clean: true,
      },
      externals: this.configureExternals(defaultModuleSystem, target),
      ignoreWarnings: [
        ...suppressExpozrWarnings(),
        ...(bundlerConfig.ignoreWarnings || []),
      ],
      experiments: {
        ...bundlerConfig.experiments,
        outputModule: this.shouldEnableOutputModule(format),
      },
      ...this.getTargetConfig(target),
    };

    // Configure module output formats
    const outputConfig = this.configureModuleOutput(
      format,
      webpackConfig,
      defaultModuleSystem
    );

    if (Array.isArray(outputConfig)) {
      // Multiple outputs for hybrid mode
      return outputConfig.map((output) => ({
        ...webpackConfig,
        output: { ...webpackConfig.output, ...output },
      }));
    } else {
      // Single output
      webpackConfig.output = { ...webpackConfig.output, ...outputConfig };
      return webpackConfig;
    }
  }

  configureHost(config: HostConfig, bundlerConfig: any): any {
    this.validateHostConfig(config);

    // Host configuration is simpler - mainly about module federation
    return {
      ...bundlerConfig,
      externals: this.createHostExternals(config),
      ignoreWarnings: [
        ...(bundlerConfig.ignoreWarnings || []),
        ...suppressExpozrWarnings(),
      ],
      plugins: [
        ...(bundlerConfig.plugins || []),
        this.createHostPlugin(config),
      ],
    };
  }

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
        outputModule: true,
      },
    };
  }

  protected createFormatConfig(
    format: ModuleFormat,
    bundlerConfig: any,
    moduleSystem: ModuleSystemConfig
  ): any {
    const baseConfig = {
      filename: this.getFilenameForFormat(format),
      chunkFilename: this.getChunkFilenameForFormat(format),
    };

    switch (format) {
      case "esm":
        return {
          ...baseConfig,
          library: {
            type: "module",
          },
          environment: {
            module: true,
            dynamicImport: true,
            arrowFunction: true,
          },
        };

      case "umd":
        return {
          ...baseConfig,
          library: {
            type: "umd",
            umdNamedDefine: true,
          },
          globalObject: 'typeof self !== "undefined" ? self : this',
        };

      case "cjs":
        return {
          ...baseConfig,
          library: {
            type: "commonjs2",
          },
        };

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private getFilenameForFormat(format: ModuleFormat): string {
    switch (format) {
      case "esm":
        return "[name].mjs";
      case "umd":
        return "[name].umd.js";
      case "cjs":
        return "[name].cjs";
      default:
        return "[name].js";
    }
  }

  private getChunkFilenameForFormat(format: ModuleFormat): string {
    switch (format) {
      case "esm":
        return "[name].[contenthash].mjs";
      case "umd":
        return "[name].[contenthash].umd.js";
      case "cjs":
        return "[name].[contenthash].cjs";
      default:
        return "[name].[contenthash].js";
    }
  }

  private shouldEnableOutputModule(
    format: ModuleFormat | ModuleFormat[]
  ): boolean {
    const formats = Array.isArray(format) ? format : [format];
    return formats.includes("esm");
  }

  private createHostExternals(config: HostConfig): any {
    // Host applications typically don't need externals
    // but might need to exclude expozr modules
    return {};
  }

  createExpozrPlugin(config: ExpozrConfig): ExpozrPlugin {
    return new ExpozrPlugin({ config });
  }

  createHostPlugin(config: HostConfig): ExpozrHostPlugin {
    return new ExpozrHostPlugin({ config });
  }

  async generateInventory(config: ExpozrConfig): Promise<Inventory> {
    return super.generateInventory(config);
  }
}

// Create default instance
export const webpackAdapter = new WebpackAdapter();

// Export plugins for direct use
export { ExpozrPlugin, ExpozrHostPlugin };

// Export convenience functions
export function createExpozrPlugin(options?: any) {
  return new ExpozrPlugin(options);
}

export function createHostPlugin(options?: any) {
  return new ExpozrHostPlugin(options);
}

/**
 * Creates a basic webpack configuration optimized for Expozr host applications
 * This replaces the old createHostConfig utility with a simpler approach
 */
export function createHostWebpackConfig(customConfig: any = {}) {
  return {
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      ...customConfig.resolve,
    },
    ignoreWarnings: [
      ...(customConfig.ignoreWarnings || []),
      ...suppressExpozrWarnings(),
    ],
    ...customConfig,
  };
}
