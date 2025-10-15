/**
 * Express Remote Server - Expozr Configuration
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "express-remote-server",
  version: "1.0.0",
  expose: {
    "./userUtils": {
      entry: "./src/modules/user-utils.ts",
      exports: ["getUserData", "createUser", "validateUser"],
    },
    "./mathUtils": {
      entry: "./src/modules/math-utils.ts",
      exports: ["calculate", "generateStats", "formatNumber"],
    },
    "./dataProcessor": {
      entry: "./src/modules/data-processor.ts",
      exports: ["processData", "transformData", "aggregateData"],
    },
  },
  build: {
    outDir: "dist",
    publicPath: "http://localhost:5001/",
  },
  metadata: {
    description: "Express server remote modules for UMD federation",
    author: "Expozr Team",
    license: "MIT",
    tags: ["express", "server", "utilities", "umd"],
  },
});
