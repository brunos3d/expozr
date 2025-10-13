/**
 * Base errors for the Expozr ecosystem
 */

export class ExpozrError extends Error {
  public readonly code: string;
  public readonly context?: any;

  constructor(message: string, code: string, context?: any) {
    super(message);
    this.name = "ExpozrError";
    this.code = code;
    this.context = context;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ExpozrError);
    }
  }
}

/**
 * Thrown when a expozr cannot be found or accessed
 */
export class ExpozrNotFoundError extends ExpozrError {
  constructor(expozrName: string, context?: any) {
    super(`Expozr "${expozrName}" not found`, "EXPOZR_NOT_FOUND", context);
    this.name = "ExpozrNotFoundError";
  }
}

/**
 * Thrown when a specific cargo cannot be found in a expozr
 */
export class CargoNotFoundError extends ExpozrError {
  constructor(cargoName: string, expozrName: string, context?: any) {
    super(
      `Cargo "${cargoName}" not found in expozr "${expozrName}"`,
      "CARGO_NOT_FOUND",
      context
    );
    this.name = "CargoNotFoundError";
  }
}

/**
 * Thrown when there are dependency resolution issues
 */
export class DependencyResolutionError extends ExpozrError {
  constructor(dependency: string, context?: any) {
    super(
      `Failed to resolve dependency "${dependency}"`,
      "DEPENDENCY_RESOLUTION_ERROR",
      context
    );
    this.name = "DependencyResolutionError";
  }
}

/**
 * Thrown when loading operations timeout
 */
export class LoadTimeoutError extends ExpozrError {
  constructor(resource: string, timeout: number, context?: any) {
    super(
      `Loading "${resource}" timed out after ${timeout}ms`,
      "LOAD_TIMEOUT",
      context
    );
    this.name = "LoadTimeoutError";
  }
}

/**
 * Thrown when network operations fail
 */
export class NetworkError extends ExpozrError {
  constructor(url: string, originalError?: Error, context?: any) {
    super(
      `Network error loading "${url}": ${originalError?.message || "Unknown error"}`,
      "NETWORK_ERROR",
      { originalError, ...context }
    );
    this.name = "NetworkError";
  }
}

/**
 * Thrown when there are version compatibility issues
 */
export class VersionMismatchError extends ExpozrError {
  constructor(required: string, found: string, context?: any) {
    super(
      `Version mismatch: required "${required}", found "${found}"`,
      "VERSION_MISMATCH",
      context
    );
    this.name = "VersionMismatchError";
  }
}

/**
 * Thrown when inventory or catalog data is invalid
 */
export class InvalidManifestError extends ExpozrError {
  constructor(
    manifestType: "inventory" | "catalog",
    reason: string,
    context?: any
  ) {
    super(`Invalid ${manifestType}: ${reason}`, "INVALID_MANIFEST", context);
    this.name = "InvalidManifestError";
  }
}

/**
 * Thrown when cache operations fail
 */
export class CacheError extends ExpozrError {
  constructor(operation: string, reason?: string, context?: any) {
    super(
      `Cache ${operation} failed${reason ? `: ${reason}` : ""}`,
      "CACHE_ERROR",
      context
    );
    this.name = "CacheError";
  }
}

/**
 * Thrown when security policies are violated
 */
export class SecurityError extends ExpozrError {
  constructor(violation: string, context?: any) {
    super(`Security violation: ${violation}`, "SECURITY_ERROR", context);
    this.name = "SecurityError";
  }
}

/**
 * Error codes enum for easier reference
 */
export enum ErrorCodes {
  EXPOZR_NOT_FOUND = "EXPOZR_NOT_FOUND",
  CARGO_NOT_FOUND = "CARGO_NOT_FOUND",
  DEPENDENCY_RESOLUTION_ERROR = "DEPENDENCY_RESOLUTION_ERROR",
  LOAD_TIMEOUT = "LOAD_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  VERSION_MISMATCH = "VERSION_MISMATCH",
  INVALID_MANIFEST = "INVALID_MANIFEST",
  CACHE_ERROR = "CACHE_ERROR",
  SECURITY_ERROR = "SECURITY_ERROR",
}
