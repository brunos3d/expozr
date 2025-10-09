/**
 * Calculator App Helper
 *
 * Simple helper for creating calculator applications using Expozr auto-loader.
 * This demonstrates how to use the reusable auto-loader utility.
 */

import { createNavigator } from "@expozr/navigator";

// Temporary local auto-loader until the navigator package is updated
interface LoaderContext {
  modules: Record<string, any>;
  functions: Record<string, Function>;
  status: "loading" | "ready" | "error";
  error?: Error;
}

/**
 * Normalize UMD module by extracting functions from various possible structures
 */
function normalizeUMDModule(cargo: any): any {
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
function extractFunctions(module: any): Record<string, Function> {
  const functions: Record<string, Function> = {};

  for (const [key, value] of Object.entries(module)) {
    if (typeof value === "function") {
      functions[key] = value;
    }
  }

  return functions;
}

/**
 * Create a calculator app with auto-loaded remote modules
 */
export async function createCalculatorApp(
  warehouseUrl: string = "http://localhost:3001/"
): Promise<LoaderContext> {
  const context: LoaderContext = {
    modules: {},
    functions: {},
    status: "loading",
  };

  try {
    console.log("🚀 Initializing calculator auto-loader...");

    // Create navigator instance
    const navigator = createNavigator({
      warehouses: {
        "math-utils": {
          url: warehouseUrl,
          version: "^1.0.0",
        },
      },
      cache: {
        strategy: "memory",
        ttl: 300000, // 5 minutes
      },
      loading: {
        timeout: 10000,
        retry: {
          attempts: 3,
          delay: 1000,
        },
      },
    });

    // Load calculator module
    console.log("📦 Loading calculator module...");
    const calculatorCargo = await navigator.loadCargo(
      "math-utils",
      "calculator"
    );
    const calculatorModule = normalizeUMDModule(calculatorCargo);
    context.modules.calculator = calculatorModule;
    Object.assign(context.functions, extractFunctions(calculatorModule));
    console.log(
      "✅ Calculator module loaded with functions:",
      Object.keys(extractFunctions(calculatorModule))
    );

    // Load advanced module
    console.log("📦 Loading advanced module...");
    const advancedCargo = await navigator.loadCargo("math-utils", "advanced");
    const advancedModule = normalizeUMDModule(advancedCargo);
    context.modules.advanced = advancedModule;
    Object.assign(context.functions, extractFunctions(advancedModule));
    console.log(
      "✅ Advanced module loaded with functions:",
      Object.keys(extractFunctions(advancedModule))
    );

    // Auto-expose functions globally
    (window as any).calculatorApp = {
      modules: context.modules,
      ...context.functions, // Expose all functions directly
    };

    context.status = "ready";
    console.log("🎉 Calculator auto-loader setup complete!");
    console.log(
      `🌐 Exposed ${Object.keys(context.functions).length} functions globally under 'calculatorApp'`
    );

    return context;
  } catch (error) {
    console.error("❌ Calculator auto-loader setup failed:", error);
    context.status = "error";
    context.error = error instanceof Error ? error : new Error(String(error));
    throw error;
  }
}
