import { Navigator } from "./navigator";

/**
 * Convenience function to load a module (cargo) from a expozr
 * This is a simplified API for common use cases
 */
export async function loadCargo(
  expozrUrl: string,
  cargoName: string
): Promise<any> {
  // Create a simple expozr name from the URL
  const expozrName = "default";

  try {
    // Create a navigator with the expozr pre-configured
    const navigator = new Navigator({
      cache: {
        strategy: "memory",
      },
      expozrs: {
        [expozrName]: {
          url: expozrUrl,
          version: "1.0.0",
        },
      },
    });

    // Load the module and return its module property
    const loadedCargo = await navigator.loadCargo(expozrName, cargoName);
    return loadedCargo.module;
  } catch (error) {
    console.error("Error in loadCargo:", error);
    throw error;
  }
}
