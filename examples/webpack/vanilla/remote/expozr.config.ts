/**
 * Simple warehouse configuration
 */

import { defineWarehouseConfig } from "@expozr/core";

export default defineWarehouseConfig({
  name: "simple-warehouse",
  version: "1.0.0",
  expose: {
    "./hello": {
      entry: "./src/hello.ts",
      exports: ["hello", "sayHello"],
    },
    "./utils": {
      entry: "./src/utils.ts",
      exports: ["add", "multiply"],
    },
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:3001/",
  },
  metadata: {
    description: "Simple warehouse example with basic utilities",
    author: "Expozr Team",
    license: "MIT",
    tags: ["utilities", "example", "simple"],
  },
});
