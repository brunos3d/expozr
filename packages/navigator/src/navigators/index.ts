/**
 * Navigator implementations for the Navigator package
 */

import type { NavigatorConfig } from "../types";
import { ExpozrNavigator } from "./enhanced-navigator";

// Navigator implementations
export { BaseExpozrNavigator } from "./base-navigator";
export { ExpozrNavigator } from "./enhanced-navigator";

/**
 * Create a navigator instance
 * @param config - Navigator configuration
 * @returns ExpozrNavigator instance
 */
export function createNavigator(config: NavigatorConfig = {}) {
  return new ExpozrNavigator(config);
}
