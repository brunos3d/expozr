// Simple TypeScript file for the remote application
export function greet(name: string): string {
  return `Hello, ${name}! This is from the remote application.`;
}

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// Get current timestamp for reload detection
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}

// Default export for easier importing - this is important for UMD
const RemoteUtils = {
  greet,
  add,
  multiply,
  getCurrentTime,
};

export default RemoteUtils;

// Main entry point - only log if we're in the main execution context
if (typeof document !== "undefined") {
  (() => {
    console.log("🚀 Remote application loaded successfully!");
    console.log(`⏰ Load time: ${getCurrentTime()}`);

    console.log("Testing remote IIFE functions:");

    console.log(greet("World"));

    console.log("2 + 3 =", add(2, 3));
    console.log("4 * 5 =", multiply(4, 5));
  })();
}
