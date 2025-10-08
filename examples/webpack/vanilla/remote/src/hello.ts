/**
 * Simple hello module for testing Expozr
 */

export function hello(name: string = "World"): string {
  return `🎉 Hello, ${name}! Welcome to Expozr! 🚀✨`;
}

export function sayHello(name?: string): void {
  console.log(hello(name));
}

// Default export
export default hello;
