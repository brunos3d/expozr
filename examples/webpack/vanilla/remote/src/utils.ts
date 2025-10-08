/**
 * Simple utilities for testing Expozr
 */

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function calculate(
  operation: "add" | "multiply",
  a: number,
  b: number
): number {
  switch (operation) {
    case "add":
      return add(a, b);
    case "multiply":
      return multiply(a, b);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

// Default export (required for proper UMD generation)
export default { add, multiply, calculate };
