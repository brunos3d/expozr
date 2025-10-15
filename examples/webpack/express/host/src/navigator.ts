// Singleton Navigator for Express Host Server
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
          url: "http://localhost:5001",
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
      }
    );

    console.log(`✅ Successfully loaded cargo: ${cargoName}`);
    return module;
  } catch (error) {
    console.error(`❌ Failed to load cargo: ${cargoName}`, error);
    throw error;
  }
}
