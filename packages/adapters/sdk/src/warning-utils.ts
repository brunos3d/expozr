/**
 * Warning suppression utilities for bundler adapters
 */

import { COMMON_WARNING_PATTERNS } from "./constants";

/**
 * Warning pattern configuration
 */
export interface WarningPattern {
  /**
   * Module pattern to match
   */
  module?: RegExp;
  /**
   * Message pattern to match
   */
  message?: RegExp;
  /**
   * File pattern to match
   */
  file?: RegExp;
}

/**
 * Get common warning patterns that should be suppressed in Expozr projects
 * These patterns are shared across webpack and other bundlers
 */
export function getCommonWarningPatterns(): WarningPattern[] {
  return [...COMMON_WARNING_PATTERNS];
}

/**
 * Create webpack ignore warnings configuration
 */
export function createWebpackIgnoreWarnings(
  additionalPatterns: WarningPattern[] = []
): WarningPattern[] {
  return [...getCommonWarningPatterns(), ...additionalPatterns];
}

/**
 * Create Vite warning filter function
 */
export function createViteWarningFilter(
  additionalPatterns: WarningPattern[] = []
): (warning: any) => boolean {
  const allPatterns = [...getCommonWarningPatterns(), ...additionalPatterns];

  return (warning: any) => {
    const { message, id, code } = warning;

    // Check if warning matches any pattern
    for (const pattern of allPatterns) {
      let matches = true;

      if (pattern.module && id && !pattern.module.test(id)) {
        matches = false;
      }

      if (pattern.message && message && !pattern.message.test(message)) {
        matches = false;
      }

      if (pattern.file && id && !pattern.file.test(id)) {
        matches = false;
      }

      if (matches) {
        return false; // Suppress this warning
      }
    }

    return true; // Keep this warning
  };
}

/**
 * Create rollup warning filter function
 */
export function createRollupWarningFilter(
  additionalPatterns: WarningPattern[] = []
): (warning: any) => boolean {
  return createViteWarningFilter(additionalPatterns);
}

/**
 * Default patterns for dynamic import warnings
 */
export const DYNAMIC_IMPORT_WARNING_PATTERNS: WarningPattern[] = [
  {
    message:
      /Critical dependency: the request of a dependency is an expression/,
  },
  {
    message: /Dynamic import/,
  },
  {
    code: /DYNAMIC_IMPORT/,
  } as any,
];

/**
 * Default patterns for React warnings
 */
export const REACT_WARNING_PATTERNS: WarningPattern[] = [
  {
    message: /React/i,
  },
  {
    module: /react/,
  },
];

/**
 * Default patterns for TypeScript warnings
 */
export const TYPESCRIPT_WARNING_PATTERNS: WarningPattern[] = [
  {
    message: /TypeScript/i,
  },
  {
    file: /\.tsx?$/,
  },
];

/**
 * Create comprehensive warning suppression for Expozr projects
 */
export function createExpozrWarningSuppressionConfig(): {
  webpack: WarningPattern[];
  vite: (warning: any) => boolean;
  rollup: (warning: any) => boolean;
} {
  const additionalPatterns = [
    ...DYNAMIC_IMPORT_WARNING_PATTERNS,
    ...REACT_WARNING_PATTERNS,
  ];

  return {
    webpack: createWebpackIgnoreWarnings(additionalPatterns),
    vite: createViteWarningFilter(additionalPatterns),
    rollup: createRollupWarningFilter(additionalPatterns),
  };
}
