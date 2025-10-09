/**
 * Calculator Module - Basic Math Operations
 *
 * This module provides fundamental mathematical operations
 * that can be consumed by any host application via UMD.
 */

/**
 * Performs addition of two numbers
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  return a + b;
}

/**
 * Performs subtraction of two numbers
 * @param a Minuend (number to subtract from)
 * @param b Subtrahend (number to subtract)
 * @returns Difference of a and b
 */
export function subtract(a: number, b: number): number {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  return a - b;
}

/**
 * Performs multiplication of two numbers
 * @param a First factor
 * @param b Second factor
 * @returns Product of a and b
 */
export function multiply(a: number, b: number): number {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  return a * b;
}

/**
 * Performs division of two numbers
 * @param a Dividend (number to be divided)
 * @param b Divisor (number to divide by)
 * @returns Quotient of a and b
 * @throws Error if divisor is zero
 */
export function divide(a: number, b: number): number {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("Both parameters must be numbers");
  }
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

/**
 * Calculator class with chainable operations
 */
export class Calculator {
  private value: number = 0;

  constructor(initialValue: number = 0) {
    this.value = initialValue;
  }

  /**
   * Add to current value
   */
  add(n: number): Calculator {
    this.value = add(this.value, n);
    return this;
  }

  /**
   * Subtract from current value
   */
  subtract(n: number): Calculator {
    this.value = subtract(this.value, n);
    return this;
  }

  /**
   * Multiply current value
   */
  multiply(n: number): Calculator {
    this.value = multiply(this.value, n);
    return this;
  }

  /**
   * Divide current value
   */
  divide(n: number): Calculator {
    this.value = divide(this.value, n);
    return this;
  }

  /**
   * Get current value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Reset calculator to zero
   */
  reset(): Calculator {
    this.value = 0;
    return this;
  }

  /**
   * Set a new value
   */
  setValue(value: number): Calculator {
    this.value = value;
    return this;
  }
}

// Default export for UMD compatibility
const calculatorModule = {
  add,
  subtract,
  multiply,
  divide,
  Calculator,
};

export default calculatorModule;
