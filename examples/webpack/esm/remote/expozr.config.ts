/**
 * Expozr configuration for remote ESM example
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "remote-esm-functions",
  version: "1.0.0",
  expose: {
    "./utils": {
      entry: "./src/index.ts",
      exports: ["greet", "getCurrentTime"],
    },
    "./math": {
      entry: "./src/math-utils.ts",
      exports: ["add", "subtract", "multiply", "divide"],
    },
    "./strings": {
      entry: "./src/string-utils.ts",
      exports: ["capitalize", "reverseString", "slugify", "truncate"],
    },
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:3001/",
    format: ["esm"], // ESM only for this example
    target: "browser",
    sourcemap: false,
    minify: false,
  },
  metadata: {
    description: "Simple remote utilities exposed as ES modules",
    author: "Expozr Team",
    license: "MIT",
    tags: ["esm", "remote", "utilities"],
  },
});
