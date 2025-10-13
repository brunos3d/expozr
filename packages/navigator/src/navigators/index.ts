/**
 * Navigator implementations for the Navigator package
 */

import type { NavigatorConfig } from "../types";
import { SimpleNavigator } from "./simple-navigator";
import { EnhancedNavigator } from "./enhanced-navigator";

// Navigator implementations
export { BaseNavigator } from "./base-navigator";
export { SimpleNavigator } from "./simple-navigator";
export { EnhancedNavigator } from "./enhanced-navigator";

/**
 * Create a navigator instance based on configuration
 * @param config - Navigator configuration
 * @returns Navigator instance
 */
export function createNavigator(config: NavigatorConfig = {}) {
  const { enhanced = true, ...navigatorConfig } = config;

  if (enhanced) {
    return new EnhancedNavigator(navigatorConfig);
  } else {
    return new SimpleNavigator(navigatorConfig);
  }
}

/**
 * Create a simple navigator instance
 * @param config - Navigator configuration
 * @returns Simple navigator instance
 */
export function createSimpleNavigator(config: any = {}) {
  return new SimpleNavigator(config);
}

/**
 * Create an enhanced navigator instance
 * @param config - Navigator configuration
 * @returns Enhanced navigator instance
 */
export function createEnhancedNavigator(config: any = {}) {
  return new EnhancedNavigator(config);
}

// Legacy exports for backward compatibility
export { SimpleNavigator as LegacyNavigator };
export { EnhancedNavigator as ExpozrNavigator };
