// Dynamic imports for Node.js modules
declare const require: any;

import type {
  Compiler,
  Compilation,
  RuleSetRule,
  EntryObject,
  ModuleOptions,
  EntryNormalized,
} from "webpack";
import type { ExpozrConfig, Inventory, Cargo, CargoConfig } from "@expozr/core";

import {
  ChecksumUtils,
  timestamp,
  ValidationUtils,
  UrlUtils,
} from "@expozr/core";

// Import SDK utilities (will be uncommented after SDK is built)
// import {
//   BaseExpozrPlugin,
//   type BasePluginOptions,
//   type PluginContext,
//   loadExpozrConfigSync,
//   configureWebpackESM,
//   configureWebpackUMD,
//   createMultiFormatWebpackConfig,
//   type ESMCompilationOptions,
//   INVENTORY_FILE_NAME
// } from "@expozr/adapter-sdk";

export interface ExpozrPluginOptions {
  configFile?: string;
  config?: ExpozrConfig;
  outputPath?: string;
  publicPath?: string;
}

/**
 * Webpack plugin for creating Expozr warehouses
 *
 * This plugin handles:
 * - Loading and validating Expozr configuration
 * - Configuring webpack for multiple module formats (ESM, UMD, CJS)
 * - Generating inventory files
 * - Supporting both development and production builds
 */
export class ExpozrPlugin {
  private options: ExpozrPluginOptions;
  private config?: ExpozrConfig;

  constructor(options: ExpozrPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const pluginName = ExpozrPlugin.name;

    // Helper function to setup configuration
    const setupConfig = (compiler: Compiler) => {
      try {
        this.loadConfig(compiler);
        this.configureWebpack(compiler);
      } catch (error) {
        compiler.hooks.failed.call(error as Error);
      }
    };

    // Load config and configure webpack for regular builds
    compiler.hooks.beforeRun.tap(pluginName, setupConfig);

    // Load config and configure webpack for watch mode (--watch)
    compiler.hooks.watchRun.tap(pluginName, setupConfig);

    // Generate inventory after compilation
    compiler.hooks.afterEmit.tapAsync(
      pluginName,
      async (compilation: Compilation, callback: (error?: Error) => void) => {
        try {
          await this.generateInventory(compiler, compilation);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      }
    );
  }

  private loadConfig(compiler: Compiler): void {
    const path = require("path");
    const fs = require("fs");

    if (this.options.config) {
      this.config = this.options.config;
      return;
    }

    if (this.options.configFile) {
      const configPath = path.resolve(
        compiler.context,
        this.options.configFile
      );

      if (fs.existsSync(configPath)) {
        try {
          const configModule = require(configPath);
          this.config = configModule.default || configModule;
        } catch (error) {
          throw new Error(
            `Failed to load config file ${this.options.configFile}: ${
              (error as Error).message
            }`
          );
        }
      } else {
        throw new Error(`Config file not found: ${this.options.configFile}`);
      }
    }

    if (!this.config) {
      // Look for default config files
      const defaultConfigs = [
        "expozr.config.ts",
        "expozr.config.js",
        "expozr.config.mjs",
        "expozr.config.cjs",
      ];

      for (const configFile of defaultConfigs) {
        const configPath = path.resolve(compiler.context, configFile);
        if (fs.existsSync(configPath)) {
          try {
            const configModule = require(configPath);
            this.config = configModule.default || configModule;
            console.log(`📋 Loaded Expozr config from ${configFile}`);
            break;
          } catch (error) {
            console.warn(
              `Failed to load ${configFile}:`,
              (error as Error).message
            );
          }
        }
      }
    }

    if (!this.config) {
      throw new Error("No Expozr configuration found");
    }

    if (!ValidationUtils.validateExpozrConfig(this.config)) {
      throw new Error("Invalid Expozr configuration");
    }
  }

  private configureWebpack(compiler: Compiler): void {
    if (!this.config) return;

    const path = require("path");
    const exposedModules: EntryNormalized = {};

    console.log(`🔧 Configuring webpack for Expozr "${this.config.name}"...`);
    console.log(
      `📦 Exposing ${Object.keys(this.config.expose).length} modules: ${Object.keys(this.config.expose).join(", ")}`
    );

    // Convert expose configuration to webpack entries
    for (const [name, cargoConfig] of Object.entries(this.config.expose)) {
      const entry =
        typeof cargoConfig === "string" ? cargoConfig : cargoConfig.entry;
      const resolvedEntry = path.resolve(compiler.context, entry);
      exposedModules[name] = {
        import: [resolvedEntry],
      };
    }

    // Merge entries: start with exposedModules from expozr.config.ts, then override with user-defined entries
    const existingEntries = compiler.options.entry || {};
    const hasExistingEntries =
      Object.keys(existingEntries).length > 0 &&
      !Object.keys(existingEntries).every((key) => key === "");

    if (exposedModules && Object.keys(exposedModules).length > 0) {
      compiler.options.entry = exposedModules;
    }

    if (hasExistingEntries) {
      console.log(
        "⚠️  User-defined entries found, merging with Expozr entries..."
      );
      compiler.options.entry = {
        ...exposedModules,
        ...existingEntries,
      };
    }

    // Get build configuration
    const { build = {} } = this.config;
    const {
      format = ["umd"],
      moduleSystem = {},
      outDir = "dist",
      publicPath = "/",
      sourcemap = true,
      minify = false,
    } = build;

    // Determine which formats to build
    const formats = Array.isArray(format) ? format : [format];
    const shouldBuildESM = formats.includes("esm");
    const shouldBuildUMD = formats.includes("umd");

    // Configure output path
    const outputPath = this.options.outputPath || outDir;

    if (shouldBuildESM && shouldBuildUMD) {
      // Multi-format build - this will be handled by creating multiple configs
      console.log(`📁 Building multiple formats: ${formats.join(", ")}`);
      this.configureMultiFormatWebpack(compiler, formats);
    } else if (shouldBuildESM) {
      // ESM-only build
      console.log("🎯 Configuring for ESM build");
      this.configureESMWebpack(compiler);
    } else {
      // UMD build (default)
      console.log("🎯 Configuring for UMD build");
      this.configureUMDWebpack(compiler);
    }

    // Set common output configuration
    compiler.options.output = {
      ...compiler.options.output,
      path: path.resolve(compiler.context, outputPath),
      publicPath: this.options.publicPath || publicPath,
      clean: true,
    };
  }

  /**
   * Configure webpack for ESM builds
   */
  private configureESMWebpack(compiler: Compiler): void {
    // Force webpack mode to 'none' to prevent CLI overrides
    compiler.options.mode = "none";
    compiler.options.target = "web";

    // Enable ESM output
    compiler.options.experiments = {
      ...compiler.options.experiments,
      outputModule: true,
    };

    // Configure output for ESM
    compiler.options.output = {
      ...compiler.options.output,
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

    // Configure TypeScript for ESM
    this.configureTypeScriptForESM(compiler, false);

    // Optimize for ESM
    compiler.options.optimization = {
      ...compiler.options.optimization,
      usedExports: true,
      providedExports: true,
      sideEffects: false,
    };
  }

  /**
   * Configure webpack for UMD builds
   */
  private configureUMDWebpack(compiler: Compiler): void {
    // Force webpack mode to 'none' to prevent CLI overrides that break UMD
    compiler.options.mode = "none";
    compiler.options.target = "web";

    // Configure output for UMD (compatible with our loading approach)
    compiler.options.output = {
      ...compiler.options.output,
      filename: "[name].umd.js",
      chunkFilename: "[name]-[contenthash].umd.js",
      library: {
        name: "[name]",
        type: "umd",
        export: "default",
      },
      globalObject: "typeof self !== 'undefined' ? self : this",
    };

    // Set UMD specific options
    (compiler.options.output as any).umdNamedDefine = true;

    // Configure TypeScript for UMD (force CommonJS)
    this.configureTypeScriptForESM(compiler, true);

    // Disable optimizations that interfere with UMD
    compiler.options.optimization = {
      ...compiler.options.optimization,
      concatenateModules: false,
      mangleExports: false,
      usedExports: false,
      minimize: false,
      splitChunks: false,
    };
  }

  /**
   * Configure webpack for multiple formats (this would ideally return multiple configs)
   */
  private configureMultiFormatWebpack(
    compiler: Compiler,
    formats: string[]
  ): void {
    // For now, default to UMD when multiple formats are requested
    // In a future version, this could be enhanced to support true multi-format builds
    console.log(
      "⚠️  Multi-format builds not fully implemented yet, defaulting to UMD"
    );
    this.configureUMDWebpack(compiler);
  }

  /**
   * Configure TypeScript compilation
   */
  private configureTypeScriptForESM(
    compiler: Compiler,
    forceCommonJS: boolean
  ): void {
    // Ensure TypeScript compiles correctly for the target format
    if (!compiler.options.module) {
      compiler.options.module = { rules: [] };
    }

    // Find and update ts-loader rule
    const tsRule = compiler.options.module.rules.find(
      (rule: any) =>
        rule &&
        typeof rule === "object" &&
        rule !== "..." &&
        rule.test &&
        rule.test.toString().includes("\\.tsx?")
    ) as RuleSetRule | undefined;

    if (tsRule && "use" in tsRule && tsRule.use) {
      const uses = Array.isArray(tsRule.use) ? tsRule.use : [tsRule.use];

      for (const use of uses) {
        if (
          typeof use === "object" &&
          (use.loader === "ts-loader" || use.loader?.includes("ts-loader"))
        ) {
          if (!use.options) use.options = {};
          if (!use.options.compilerOptions) use.options.compilerOptions = {};

          if (forceCommonJS) {
            // Force CommonJS compilation for UMD compatibility
            use.options.compilerOptions.module = "CommonJS";
            use.options.compilerOptions.target = "ES5";
          } else {
            // Use ESNext for modern ESM builds
            use.options.compilerOptions.module = "ESNext";
            use.options.compilerOptions.target = "ES2020";
            use.options.compilerOptions.moduleResolution = "bundler";
          }

          console.log(
            `📝 TypeScript configured for ${forceCommonJS ? "CommonJS" : "ESM"} compilation`
          );
        }
      }
    }
  }

  private async generateInventory(
    compiler: Compiler,
    compilation: Compilation
  ): Promise<void> {
    if (!this.config) return;

    try {
      const path = require("path");
      const fs = require("fs").promises;

      console.log("📋 Generating Expozr inventory...");

      const {
        name,
        version,
        expose,
        dependencies = {},
        metadata = {},
      } = this.config;
      const { build = {} } = this.config;
      const { publicPath = "/", outDir = "dist" } = build;

      // Generate cargo manifest
      const cargo: Record<string, Cargo> = {};
      for (const [cargoName, cargoConfig] of Object.entries(expose)) {
        const compiledAsset = this.findCompiledAsset(compilation, cargoName);

        if (compiledAsset) {
          const config =
            typeof cargoConfig === "string"
              ? { entry: cargoConfig }
              : cargoConfig;

          cargo[cargoName] = {
            name: cargoName,
            version,
            url: `${publicPath.replace(/\/$/, "")}/${compiledAsset}`,
            type: config.type || "component",
            metadata: {
              ...config.metadata,
              format: "umd", // TODO: Detect actual format
              size: compilation.assets[compiledAsset]?.size() || 0,
            },
          };
        }
      }

      // Create inventory
      const inventory: Inventory = {
        expozr: {
          name,
          version,
          url: publicPath,
          description: metadata.description,
          author: metadata.author,
        },
        cargo,
        dependencies,
        timestamp: timestamp(),
        checksum: ChecksumUtils.generate({ cargo, dependencies }),
      };

      // Write inventory file
      const outputPath = this.options.outputPath || outDir;
      const inventoryPath = path.join(
        compilation.options.output?.path ||
          path.resolve(compiler.context, outputPath),
        "expozr.inventory.json"
      );

      await fs.writeFile(
        inventoryPath,
        JSON.stringify(inventory, null, 2),
        "utf-8"
      );

      console.log(`✅ Expozr inventory generated: ${inventoryPath}`);
      console.log(`📦 Cargo entries: ${Object.keys(cargo).length}`);
    } catch (error) {
      console.error("❌ Failed to generate Expozr inventory:", error);
      throw error;
    }
  }

  private findCompiledAsset(
    compilation: Compilation,
    entryName: string
  ): string {
    // Look for the compiled asset that matches the entry name
    const assets = Object.keys(compilation.assets);

    // First, try to find exact match
    const exactMatch = assets.find(
      (asset) =>
        asset.startsWith(entryName) &&
        (asset.endsWith(".js") ||
          asset.endsWith(".mjs") ||
          asset.endsWith(".umd.js"))
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Fallback to any asset that contains the entry name
    const partialMatch = assets.find(
      (asset) =>
        asset.includes(entryName) &&
        (asset.endsWith(".js") ||
          asset.endsWith(".mjs") ||
          asset.endsWith(".umd.js"))
    );

    return partialMatch || `${entryName}.js`;
  }
}
