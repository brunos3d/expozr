/**
 * Auto-Loader Utility for UMD Modules
 *
 * This utility automatically handles the complexity of loading, accessing,
 * and exposing remote UMD modules, providing a seamless developer experience.
 */

import { createNavigator } from "./navigators";
import {
  normalizeUMDModule,
  extractFunctions,
  waitForCondition,
} from "./utils";
import type { AutoLoaderConfig, LoaderContext, LoadedModule } from "./types";

/**
 * Create an auto-loader for remote modules with simplified API
 * @param config - Auto-loader configuration
 * @returns Promise resolving to loader context
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
    // Create navigator instance
    const expozrConfig = Object.entries(config.expozrs).reduce(
      (acc, [name, { url, version }]) => {
        acc[name] = { url, version: version || "^1.0.0" };
        return acc;
      },
      {} as Record<string, { url: string; version: string }>
    );

    // You can reuse the navigator instance across your application
    const navigator = createNavigator({
      expozrs: expozrConfig,
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

    // Load all modules from all expozrs
    for (const [expozrName, expozrConfig] of Object.entries(config.expozrs)) {
      for (const [moduleName, cargoName] of Object.entries(
        expozrConfig.modules
      )) {
        try {
          // Load the cargo
          const cargoKey = Array.isArray(cargoName) ? cargoName[0] : cargoName;
          const loadedCargo = await navigator.loadCargo(expozrName, cargoKey);

          // Normalize UMD module structure
          const normalizedModule = normalizeUMDModule(loadedCargo);
          context.modules[moduleName] = normalizedModule;

          // Extract functions from the module
          const moduleFunctions = extractFunctions(normalizedModule);
          Object.assign(context.functions, moduleFunctions);
        } catch (error) {
          console.error(`Failed to load module ${moduleName}:`, error);
          throw error;
        }
      }
    }

    // Auto-expose functions globally if enabled
    if (config.autoExpose !== false) {
      exposeGlobally(context, config.globalNamespace || "expozr");
    }

    context.status = "ready";
    return context;
  } catch (error) {
    context.status = "error";
    context.error = error instanceof Error ? error : new Error(String(error));
    throw error;
  }
}

/**
 * Expose functions globally under a namespace
 * @param context - Loader context
 * @param namespace - Global namespace to use
 */
function exposeGlobally(context: LoaderContext, namespace: string): void {
  if (typeof window !== "undefined") {
    // Create global namespace
    (window as any)[namespace] = {
      modules: context.modules,
      ...context.functions, // Expose all functions directly
    };
  }
}

/**
 * Helper to wait for loading to be ready
 * @param context - Loader context
 * @param maxWait - Maximum time to wait in milliseconds
 * @returns Promise that resolves when ready
 */
export function waitForReady(
  context: LoaderContext,
  maxWait: number = 30000
): Promise<void> {
  return waitForCondition(() => context.status === "ready", maxWait, 100).catch(
    () => {
      if (context.status === "error") {
        throw context.error || new Error("Auto-loader failed");
      }
      throw new Error("Auto-loader timeout");
    }
  );
}

/**
 * Type-safe function caller with automatic error handling
 * @param context - Loader context
 * @param functionName - Name of function to call
 * @param args - Arguments to pass to function
 * @returns Function result
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

/**
 * Get available functions from the loader context
 * @param context - Loader context
 * @returns Array of available function names
 */
export function getAvailableFunctions(context: LoaderContext): string[] {
  return Object.keys(context.functions);
}

/**
 * Get available modules from the loader context
 * @param context - Loader context
 * @returns Array of available module names
 */
export function getAvailableModules(context: LoaderContext): string[] {
  return Object.keys(context.modules);
}

/**
 * Get module by name from the loader context
 * @param context - Loader context
 * @param moduleName - Name of module to get
 * @returns Module object or undefined
 */
export function getModule(
  context: LoaderContext,
  moduleName: string
): LoadedModule | undefined {
  return context.modules[moduleName];
}

/**
 * Check if a function is available in the loader context
 * @param context - Loader context
 * @param functionName - Name of function to check
 * @returns True if function is available
 */
export function hasFunction(
  context: LoaderContext,
  functionName: string
): boolean {
  return functionName in context.functions;
}

/**
 * Create a proxy object that allows calling remote functions directly
 * @param context - Loader context
 * @returns Proxy object for calling remote functions
 */
export function createFunctionProxy(
  context: LoaderContext
): Record<string, Function> {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop === "string" && context.functions[prop]) {
          return (...args: any[]) => callRemoteFunction(context, prop, ...args);
        }
        return undefined;
      },

      has(target, prop) {
        return typeof prop === "string" && prop in context.functions;
      },

      ownKeys(target) {
        return Object.keys(context.functions);
      },
    }
  );
}
