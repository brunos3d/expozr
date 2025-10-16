/**
 * Example React expozr configuration
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "next-remote",
  version: "1.0.0",
  expose: {
    "./Button": {
      entry: "./src/components/Button.tsx",
      exports: ["Button", "ButtonProps"],
      overrideAssetName: "Button.js",
    },
  },
  dependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
  build: {
    format: "umd",
    minify: false,
    sourcemap: false,
    // outDir: "public",
    outDir: ".next/static/chunks",
    publicPath: "http://localhost:3001/",
  },
  metadata: {
    description: "Webpack React components example from Expozr Team",
    author: "Expozr Team",
    license: "MIT",
    tags: ["react", "components", "ui"],
  },
});
