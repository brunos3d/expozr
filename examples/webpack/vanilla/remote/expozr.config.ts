/**
 * Simple expozr configuration
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "simple-expozr",
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
    description: "Simple expozr example with basic utilities",
    author: "Expozr Team",
    license: "MIT",
    tags: ["utilities", "example", "simple"],
  },
});
