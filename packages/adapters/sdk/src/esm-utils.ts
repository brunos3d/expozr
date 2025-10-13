/**
 * ESM-specific utilities for webpack configuration
 */

import type { ModuleSystemConfig } from "@expozr/core";

/**
 * ESM compilation options for webpack
 */
export interface ESMCompilationOptions {
  /**
   * Whether to force CommonJS compilation for UMD compatibility
   */
  forceCommonJS?: boolean;
  /**
   * Whether to enable tree shaking
   */
  enableTreeShaking?: boolean;
  /**
   * Whether to enable code splitting
   */
  enableCodeSplitting?: boolean;
  /**
   * Custom target environment
   */
  targetEnvironment?: string;
}

/**
 * Configure webpack for ESM compilation
 */
export function configureWebpackESM(
  webpackConfig: any,
  moduleSystem: ModuleSystemConfig,
  options: ESMCompilationOptions = {}
): any {
  const {
    forceCommonJS = false,
    enableTreeShaking = true,
    enableCodeSplitting = false,
    targetEnvironment = "es2020",
  } = options;

  // Base ESM configuration
  const esmConfig = {
    ...webpackConfig,
    target: "web",
    mode: webpackConfig.mode || "production",
    experiments: {
      ...webpackConfig.experiments,
      outputModule: true,
    },
    output: {
      ...webpackConfig.output,
      module: true,
      environment: {
        module: true,
        dynamicImport: true,
        arrowFunction: true,
      },
    },
  };

  // Configure module rules for ESM
  if (!esmConfig.module) {
    esmConfig.module = { rules: [] };
  }

  // TypeScript configuration for ESM
  const tsRule = findTypeScriptRule(esmConfig.module.rules);
  if (tsRule) {
    updateTypeScriptRuleForESM(tsRule, forceCommonJS, targetEnvironment);
  }

  // Optimization for ESM
  esmConfig.optimization = {
    ...esmConfig.optimization,
    usedExports: enableTreeShaking,
    providedExports: enableTreeShaking,
    sideEffects: false,
  };

  // Code splitting configuration
  if (enableCodeSplitting) {
    esmConfig.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    };
  }

  return esmConfig;
}

/**
 * Configure webpack for UMD compilation (legacy support)
 */
export function configureWebpackUMD(
  webpackConfig: any,
  moduleSystem: ModuleSystemConfig,
  globalName?: string
): any {
  return {
    ...webpackConfig,
    mode: "none", // Prevent CLI overrides that break UMD
    target: "web",
    experiments: {
      ...webpackConfig.experiments,
      outputModule: false,
    },
    output: {
      ...webpackConfig.output,
      library: {
        name: globalName || "[name]",
        type: "umd",
        export: "default",
      },
      globalObject: "typeof self !== 'undefined' ? self : this",
      umdNamedDefine: true,
    },
    optimization: {
      ...webpackConfig.optimization,
      // Disable optimizations that interfere with UMD
      concatenateModules: false,
      mangleExports: false,
      usedExports: false,
    },
  };
}

/**
 * Create multi-format webpack configuration
 */
export function createMultiFormatWebpackConfig(
  baseConfig: any,
  formats: ("esm" | "umd" | "cjs")[],
  moduleSystem: ModuleSystemConfig,
  options: ESMCompilationOptions = {}
): any[] {
  const configs: any[] = [];

  for (const format of formats) {
    switch (format) {
      case "esm":
        configs.push({
          ...configureWebpackESM(baseConfig, moduleSystem, options),
          output: {
            ...baseConfig.output,
            filename: "[name].mjs",
            chunkFilename: "[name]-[contenthash].mjs",
          },
        });
        break;

      case "umd":
        configs.push({
          ...configureWebpackUMD(baseConfig, moduleSystem),
          output: {
            ...baseConfig.output,
            filename: "[name].umd.js",
            chunkFilename: "[name]-[contenthash].umd.js",
          },
        });
        break;

      case "cjs":
        configs.push({
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
        });
        break;
    }
  }

  return configs;
}

/**
 * Find TypeScript rule in webpack module rules
 */
function findTypeScriptRule(rules: any[]): any {
  return rules.find(
    (rule: any) =>
      rule &&
      typeof rule === "object" &&
      rule !== "..." &&
      rule.test &&
      rule.test.toString().includes("\\.tsx?")
  );
}

/**
 * Update TypeScript rule for ESM compilation
 */
function updateTypeScriptRuleForESM(
  tsRule: any,
  forceCommonJS: boolean,
  targetEnvironment: string
): void {
  if (!tsRule.use) return;

  const uses = Array.isArray(tsRule.use) ? tsRule.use : [tsRule.use];

  for (const use of uses) {
    if (
      typeof use === "object" &&
      (use.loader === "ts-loader" || use.loader?.includes("ts-loader"))
    ) {
      if (!use.options) use.options = {};
      if (!use.options.compilerOptions) use.options.compilerOptions = {};

      // Configure TypeScript for ESM or CommonJS
      if (forceCommonJS) {
        use.options.compilerOptions.module = "CommonJS";
        use.options.compilerOptions.target = "ES5";
      } else {
        use.options.compilerOptions.module = "ESNext";
        use.options.compilerOptions.target = targetEnvironment;
        use.options.compilerOptions.moduleResolution = "bundler";
      }
    }
  }
}

/**
 * Get ESM-compatible externals configuration
 */
export function getESMExternals(
  commonExternals: Record<string, any>
): Record<string, any> {
  const esmExternals: Record<string, any> = {};

  for (const [key, value] of Object.entries(commonExternals)) {
    // For ESM, we want to use module imports
    esmExternals[key] = {
      module: key,
      import: key,
    };
  }

  return esmExternals;
}

/**
 * Configure webpack resolve for ESM
 */
export function configureESMResolve(baseResolve: any = {}): any {
  return {
    ...baseResolve,
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
      ...baseResolve.extensionAlias,
    },
    extensions: [".mts", ".ts", ".tsx", ".mjs", ".js", ".jsx"],
    conditionNames: ["import", "module", "default"],
  };
}
