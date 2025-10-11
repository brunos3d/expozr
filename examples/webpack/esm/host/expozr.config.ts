/**
 * ESM host configuration
 * This host consumes ESM modules from the remote ESM application
 */

import { defineHostConfig } from "@expozr/core";

export default defineHostConfig({
  expozrs: {
    "remote-esm-functions": {
      url: "http://localhost:3001/",
      version: "^1.0.0",
      alias: "remote",
    },
  },
  loading: {
    timeout: 5000,
  },
});
