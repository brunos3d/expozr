/**
 * Navigator implementations for the Navigator package
 */

import type { NavigatorConfig } from "../types";
import { ExpozrNavigator } from "./enhanced-navigator";

// Navigator implementations
export { BaseExpozrNavigator } from "./base-navigator";
export { ExpozrNavigator } from "./enhanced-navigator";

/**
 * Create an ExpozrNavigator instance
 * @param config - Navigator configuration
 * @returns ExpozrNavigator instance
 */
export function createExpozrNavigator(config: any = {}) {
  return new ExpozrNavigator(config);
}

/**
 * Create a navigator instance (alias for createExpozrNavigator)
 * @param config - Navigator configuration
 * @returns ExpozrNavigator instance
 */
export function createNavigator(config: NavigatorConfig = {}) {
  return new ExpozrNavigator(config);
}
