/**
 * Advanced Math Module - Extended Mathematical Operations
 *
 * This module provides advanced mathematical operations
 * that complement the basic calculator functionality.
 */

/**
 * Calculates the power of a number
 * @param base The base number
 * @param exponent The exponent
 * @returns base raised to the power of exponent
 */
export function power(base: number, exponent: number): number {
  if (typeof base !== "number" || typeof exponent !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  return Math.pow(base, exponent);
}

/**
 * Calculates the square root of a number
 * @param value The number to calculate square root for
 * @returns Square root of the value
 * @throws Error if value is negative
 */
export function sqrt(value: number): number {
  if (typeof value !== "number") {
    throw new Error("Parameter must be a number");
  }
  if (value < 0) {
    throw new Error("Cannot calculate square root of negative number");
  }
  return Math.sqrt(value);
}

/**
 * Calculates the factorial of a number
 * @param n The number to calculate factorial for
 * @returns Factorial of n
 * @throws Error if n is negative or not an integer
 */
export function factorial(n: number): number {
  if (typeof n !== "number") {
    throw new Error("Parameter must be a number");
  }
  if (n < 0) {
    throw new Error("Cannot calculate factorial of negative number");
  }
  if (!Number.isInteger(n)) {
    throw new Error("Parameter must be an integer");
  }

  if (n === 0 || n === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculates the percentage of a value
 * @param value The base value
 * @param percentage The percentage to calculate
 * @returns The percentage of the value
 */
export function percentage(value: number, percentage: number): number {
  if (typeof value !== "number" || typeof percentage !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  return (value * percentage) / 100;
}

/**
 * Rounds a number to specified decimal places
 * @param value The number to round
 * @param decimals Number of decimal places
 * @returns Rounded number
 */
export function round(value: number, decimals: number = 0): number {
  if (typeof value !== "number" || typeof decimals !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  if (decimals < 0) {
    throw new Error("Decimals must be non-negative");
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// Default export for UMD compatibility
const advancedModule = {
  power,
  sqrt,
  factorial,
  percentage,
  round,
};

export default advancedModule;
