import { Navigator } from "./navigator";

/**
 * Convenience function to load a module (cargo) from a warehouse
 * This is a simplified API for common use cases
 */
export async function loadCargo(
  warehouseUrl: string,
  cargoName: string
): Promise<any> {
  // Create a simple warehouse name from the URL
  const warehouseName = "default";

  try {
    // Create a navigator with the warehouse pre-configured
    const navigator = new Navigator({
      cache: {
        strategy: "memory",
      },
      warehouses: {
        [warehouseName]: {
          url: warehouseUrl,
          version: "1.0.0",
        },
      },
    });

    // Load the module and return its module property
    const loadedCargo = await navigator.loadCargo(warehouseName, cargoName);
    return loadedCargo.module;
  } catch (error) {
    console.error("Error in loadCargo:", error);
    throw error;
  }
}
