// Math utilities module for UMD federation

export interface CalculationResult {
  operation: string;
  operands: number[];
  result: number;
  timestamp: string;
}

export interface Statistics {
  mean: number;
  median: number;
  mode: number;
  min: number;
  max: number;
  count: number;
}

export function calculate(
  operation: string,
  ...operands: number[]
): CalculationResult {
  let result: number;

  switch (operation.toLowerCase()) {
    case "add":
      result = operands.reduce((sum, num) => sum + num, 0);
      break;
    case "subtract":
      result = operands.reduce(
        (diff, num, index) => (index === 0 ? num : diff - num),
        0
      );
      break;
    case "multiply":
      result = operands.reduce((product, num) => product * num, 1);
      break;
    case "divide":
      result = operands.reduce(
        (quotient, num, index) => (index === 0 ? num : quotient / num),
        1
      );
      break;
    case "power":
      result = Math.pow(operands[0] || 0, operands[1] || 1);
      break;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return {
    operation,
    operands,
    result,
    timestamp: new Date().toISOString(),
  };
}

export function generateStats(numbers: number[]): Statistics {
  const sorted = [...numbers].sort((a, b) => a - b);
  const count = numbers.length;
  const sum = numbers.reduce((acc, num) => acc + num, 0);

  // Calculate mean
  const mean = sum / count;

  // Calculate median
  const median =
    count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

  // Calculate mode (most frequent number)
  const frequency: { [key: number]: number } = {};
  numbers.forEach((num) => {
    frequency[num] = (frequency[num] || 0) + 1;
  });

  const mode = Object.keys(frequency).reduce((a, b) =>
    frequency[Number(a)] > frequency[Number(b)] ? a : b
  );

  return {
    mean: Math.round(mean * 100) / 100,
    median,
    mode: Number(mode),
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    count,
  };
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Default export for UMD compatibility
const MathUtils = {
  calculate,
  generateStats,
  formatNumber,
};

export default MathUtils;

// Log when module is loaded
if (typeof console !== "undefined") {
  console.log("🔢 MathUtils module loaded successfully!");
}
