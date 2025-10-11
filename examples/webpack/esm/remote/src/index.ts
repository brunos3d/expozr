import { add, multiply } from "./math-utils";

// Simple TypeScript file for the remote ESM application
export function greet(name: string): string {
  return `Hello, ${name}! This is from the remote ESM application.`;
}

// Get current timestamp for reload detection
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}

// Default export for easier importing
export default {
  greet,
  getCurrentTime,
};

// Main entry point - only log if we're in the main execution context
if (typeof document !== "undefined") {
  console.log("🚀 Remote application loaded successfully!");
  console.log(`⏰ Load time: ${getCurrentTime()}`);
  console.log(greet("World"));
  console.log("2 + 3 =", add(2, 3));
  console.log("4 * 5 =", multiply(4, 5));
}
