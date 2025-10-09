/**
 * UMD Math Utils Warehouse Configuration
 *
 * This configuration exposes math utility functions as UMD modules
 * that can be consumed by any host application.
 */

import { defineWarehouseConfig } from "@expozr/core";

export default defineWarehouseConfig({
  name: "math-utils",
  version: "1.0.0",
  expose: {
    "./calculator": {
      entry: "./src/calculator.ts",
      exports: ["add", "subtract", "multiply", "divide", "Calculator"],
    },
    "./advanced": {
      entry: "./src/advanced.ts",
      exports: ["power", "sqrt", "factorial"],
    },
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:3001/",
  },
  metadata: {
    description: "Math utility functions for UMD consumption",
    author: "Expozr Team",
    license: "MIT",
    tags: ["math", "calculator", "umd", "utilities"],
  },
});
