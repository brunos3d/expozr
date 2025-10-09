/**
 * @expozr/react - React utilities for the Expozr ecosystem
 *
 * This package provides React-specific utilities for loading and consuming
 * components from Expozr warehouses with simplified APIs.
 */

export {
  setupReactGlobals,
  loadReactUMDModule,
  loadReactWarehouse,
  bootstrapReactWarehouse,
} from "./react-utils";

// Re-export core navigator utilities for convenience
export { loadUMDModule, loadWarehouseInventory } from "@expozr/navigator";
