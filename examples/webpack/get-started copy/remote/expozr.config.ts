/**
 * Simple expozr configuration
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "umd-remote-app",
  version: "1.0.0",
  expose: {
    "./utils": {
      entry: "./src/index.ts",
      exports: ["greet", "add", "multiply", "getCurrentTime"],
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
