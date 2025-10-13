/**
 * Utility exports for the Navigator package
 */

// Event handling utilities
export { SimpleEventEmitter } from "./event-emitter";

// Module validation and handling utilities
export {
  isValidReactComponent,
  isValidModule,
  isWebpackGlobal,
  normalizeUMDModule,
  hasValidFunctions,
  extractFunctions,
  createTimeoutPromise,
  waitForCondition,
} from "./module-utils";

// URL and path utilities
export {
  normalizeUrl,
  joinUrlParts,
  generateCargoKey,
  isValidUrl,
  getInventoryUrl,
  getModuleUrl,
  getFileExtension,
  isJavaScriptModule,
  generateFormatUrls,
} from "./url-utils";
