/**
 * Auto-Loader Utility for UMD Modules
 *
 * This utility automatically handles the complexity of loading, accessing,
 * and exposing remote UMD modules, providing a seamless developer experience.
 */

import { createNavigator } from "./enhanced-navigator";

export interface AutoLoaderConfig {
  warehouses: Record<
    string,
    {
      url: string;
      version?: string;
      modules: Record<string, string | string[]>; // module name -> cargo name or function names
    }
  >;
  globalNamespace?: string; // Default: 'expozr'
  autoExpose?: boolean; // Automatically expose functions globally
  timeout?: number;
  retries?: number;
}

export interface LoadedModule {
  [key: string]: any;
}

export interface LoaderContext {
  modules: Record<string, LoadedModule>;
  functions: Record<string, Function>;
  status: "loading" | "ready" | "error";
  error?: Error;
}

/**
 * Normalize UMD module by extracting functions from various possible structures
 */
function normalizeUMDModule(cargo: any): LoadedModule {
  let module = cargo.module || cargo;

  // Try different access patterns for UMD modules
  if (module && typeof module === "object") {
    // 1. Direct exports
    if (hasValidFunctions(module)) {
      return module;
    }

    // 2. Default export (webpack library.export: "default")
    if (module.default && hasValidFunctions(module.default)) {
      return module.default;
    }

    // 3. Exports property
    if (module.exports && hasValidFunctions(module.exports)) {
      return module.exports;
    }

    // 4. Nested default.exports
    if (module.default?.exports && hasValidFunctions(module.default.exports)) {
      return module.default.exports;
    }
  }

  // If no valid structure found, return the module as-is
  return module || {};
}

/**
 * Check if an object has valid function exports
 */
function hasValidFunctions(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;

  const functions = Object.keys(obj).filter(
    (key) => typeof obj[key] === "function"
  );
  return functions.length > 0;
}

/**
 * Extract all functions from a module
 */
function extractFunctions(module: LoadedModule): Record<string, Function> {
  const functions: Record<string, Function> = {};

  for (const [key, value] of Object.entries(module)) {
    if (typeof value === "function") {
      functions[key] = value;
    }
  }

  return functions;
}

/**
 * Create an auto-loader for remote modules with simplified API
 */
export async function createAutoLoader(
  config: AutoLoaderConfig
): Promise<LoaderContext> {
  const context: LoaderContext = {
    modules: {},
    functions: {},
    status: "loading",
  };

  try {
    console.log("🚀 Initializing auto-loader...");

    // Create navigator instance
    const warehouseConfig = Object.entries(config.warehouses).reduce(
      (acc, [name, { url, version }]) => {
        acc[name] = { url, version: version || "^1.0.0" };
        return acc;
      },
      {} as Record<string, { url: string; version: string }>
    );

    const navigator = createNavigator({
      warehouses: warehouseConfig,
      cache: {
        strategy: "memory",
        ttl: 300000, // 5 minutes
      },
      loading: {
        timeout: config.timeout || 10000,
        retry: {
          attempts: config.retries || 3,
          delay: 1000,
        },
      },
    });

    // Load all modules from all warehouses
    for (const [warehouseName, warehouseConfig] of Object.entries(
      config.warehouses
    )) {
      console.log(`📦 Loading modules from warehouse: ${warehouseName}`);

      for (const [moduleName, cargoName] of Object.entries(
        warehouseConfig.modules
      )) {
        try {
          console.log(
            `  - Loading module: ${moduleName} (cargo: ${cargoName})`
          );

          const cargo = await navigator.loadCargo(
            warehouseName,
            cargoName as string
          );
          const normalizedModule = normalizeUMDModule(cargo);

          // Store the module
          context.modules[moduleName] = normalizedModule;

          // Extract and store functions
          const moduleFunctions = extractFunctions(normalizedModule);
          Object.assign(context.functions, moduleFunctions);

          console.log(
            `  ✅ Module ${moduleName} loaded with functions:`,
            Object.keys(moduleFunctions)
          );
        } catch (error) {
          console.error(`  ❌ Failed to load module ${moduleName}:`, error);
          throw error;
        }
      }
    }

    // Auto-expose functions globally if enabled
    if (config.autoExpose !== false) {
      const globalNamespace = config.globalNamespace || "expozr";

      // Create global namespace
      (window as any)[globalNamespace] = {
        modules: context.modules,
        ...context.functions, // Expose all functions directly
      };

      console.log(
        `🌐 Exposed ${Object.keys(context.functions).length} functions globally under '${globalNamespace}'`
      );
    }

    context.status = "ready";
    console.log("🎉 Auto-loader setup complete!");

    return context;
  } catch (error) {
    console.error("❌ Auto-loader setup failed:", error);
    context.status = "error";
    context.error = error instanceof Error ? error : new Error(String(error));
    throw error;
  }
}

/**
 * Helper to wait for loading to be ready
 */
export function waitForReady(
  context: LoaderContext,
  maxWait: number = 30000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkReady = () => {
      if (context.status === "ready") {
        resolve();
      } else if (context.status === "error") {
        reject(context.error || new Error("Auto-loader failed"));
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error("Auto-loader timeout"));
      } else {
        setTimeout(checkReady, 100);
      }
    };

    checkReady();
  });
}

/**
 * Type-safe function caller with automatic error handling
 */
export function callRemoteFunction(
  context: LoaderContext,
  functionName: string,
  ...args: any[]
): any {
  if (context.status !== "ready") {
    throw new Error(`Auto-loader not ready. Status: ${context.status}`);
  }

  const func = context.functions[functionName];
  if (!func || typeof func !== "function") {
    throw new Error(`Function '${functionName}' not found in loaded modules`);
  }

  try {
    return func(...args);
  } catch (error) {
    console.error(`Error calling remote function '${functionName}':`, error);
    throw error;
  }
}
