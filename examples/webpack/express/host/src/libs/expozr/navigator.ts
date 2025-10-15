// Singleton Navigator for Express Host Server
import * as vm from "vm";
import * as https from "https";
import * as http from "http";
import { createNavigator, ExpozrNavigator } from "@expozr/navigator";

// Export types for route handlers
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

export interface CalculationResult {
  operation: string;
  operands: number[];
  result: number;
  timestamp: string;
}

export interface Statistics {
  mean: number;
  median: number;
  mode: number;
  min: number;
  max: number;
  count: number;
}

export interface DataRecord {
  id: string;
  timestamp: string;
  value: any;
  type: string;
  metadata?: Record<string, any>;
}

export interface ProcessedData {
  originalCount: number;
  processedCount: number;
  processingTime: number;
  results: DataRecord[];
  summary: Record<string, any>;
}

// Global singleton instance
let navigatorInstance: any | null = null;

export const EXPOZR_REMOTE_URL = "http://localhost:5001"; // URL of the remote expozr

/**
 * Get the singleton navigator instance
 * This ensures we reuse the same navigator across all routes
 */
export function getNavigator(): ExpozrNavigator {
  if (!navigatorInstance) {
    console.log("🧭 Creating new Navigator singleton instance...");

    navigatorInstance = createNavigator({
      expozrs: {
        "express-remote-server": {
          url: EXPOZR_REMOTE_URL,
          version: "1.0.0",
        },
      },
      cache: {
        strategy: "memory", // Use memory cache for server
        ttl: 300000, // 5 minutes
        maxSize: 50,
      },
      loading: {
        timeout: 10000, // 10 seconds
      },
    });

    console.log("✅ Navigator singleton created successfully!");
  }

  return navigatorInstance;
}

/**
 * Load a cargo module using UMD format
 */
export async function loadCargo<T = any>(cargoName: string): Promise<T> {
  const navigator = getNavigator();

  console.log(`📦 Loading cargo: ${cargoName}`);

  try {
    const { module } = await navigator.loadCargo<T>(
      "express-remote-server",
      cargoName,
      {
        moduleFormat: "umd", // Explicit UMD format
        automaticModuleDiscovery: false, // Disable auto discovery for server
      }
    );

    console.log(`✅ Successfully loaded cargo: ${cargoName}`);
    return module;
  } catch (error) {
    console.error(`❌ Failed to load cargo: ${cargoName}`, error);
    throw error;
  }
}

/// TODO: This is a temporary workaround until we have proper UMD support in the navigator for Node.js
/**
 * Custom UMD loader for Node.js server environment
 * Fetches UMD modules over HTTP and executes them safely
 */
export async function loadNodeUMDCargo(cargoName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${EXPOZR_REMOTE_URL}/${cargoName.replace("./", "")}.js`;

    console.log(`🌐 Fetching UMD module from: ${url}`);

    const client = url.startsWith("https:") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            // Create mock browser APIs
            const mockEventTarget = {
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => true,
            };

            const mockLocation = {
              href: url,
              protocol: new URL(url).protocol,
              host: new URL(url).host,
              hostname: new URL(url).hostname,
              port: new URL(url).port,
              pathname: new URL(url).pathname,
              search: "",
              hash: "",
            };

            const mockDocument = {
              ...mockEventTarget,
              createElement: () => mockEventTarget,
              createTextNode: () => ({}),
              querySelector: () => null,
              querySelectorAll: () => [],
              getElementById: () => null,
              getElementsByTagName: () => [],
              body: mockEventTarget,
              head: mockEventTarget,
              documentElement: mockEventTarget,
            };

            const mockWindow = {
              ...mockEventTarget,
              document: mockDocument,
              location: mockLocation,
              navigator: { userAgent: "Node.js" },
              setTimeout,
              clearTimeout,
              setInterval,
              clearInterval,
              fetch: undefined,
              XMLHttpRequest: undefined,
            };

            // Create a safe execution context with proper browser mocks
            const sandbox = {
              module: { exports: {} },
              exports: {},
              require: require,
              console: console,
              setTimeout,
              clearTimeout,
              setInterval,
              clearInterval,
              // Browser globals - all pointing to our mock
              global: mockWindow,
              window: mockWindow,
              self: mockWindow,
              document: mockDocument,
              location: mockLocation,
              navigator: mockWindow.navigator,
              // Make 'this' point to the window mock in global scope
              this: undefined, // Will be set to global context
            };

            // Execute the UMD module in the sandbox
            const context = vm.createContext(sandbox);

            // Wrap in try-catch to handle webpack-dev-server or other client-only code
            const wrappedCode = `
              (function() {
                try {
                  ${data}
                } catch (err) {
                  // Suppress errors from browser-only code (like webpack-dev-server)
                  if (err.message && (
                    err.message.includes('addEventListener') ||
                    err.message.includes('document') ||
                    err.message.includes('window')
                  )) {
                    console.warn('⚠️ Browser-only code detected, skipping:', err.message);
                  } else {
                    throw err;
                  }
                }
              })();
            `;

            vm.runInContext(wrappedCode, context);

            // Extract the module exports
            const moduleExports =
              sandbox.module.exports || sandbox.exports || {};

            // Check if we got valid exports
            if (
              Object.keys(moduleExports).length === 0 &&
              moduleExports.constructor === Object
            ) {
              console.warn(
                `⚠️ Warning: No exports found in UMD module from: ${url}`
              );
              console.warn(
                `   This might be a client-only bundle (webpack-dev-server).`
              );
            }

            console.log(`✅ Successfully loaded UMD module from: ${url}`);
            resolve(moduleExports);
          } catch (error) {
            console.error(`❌ Failed to execute UMD module: ${error}`);
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        console.error(`❌ Failed to fetch UMD module: ${error}`);
        reject(error);
      });
  });
}
