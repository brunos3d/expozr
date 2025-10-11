/**
 * Simple host configuration
 * This host primarily consumes modules but could also expose some
 */

import { defineExpozrConfig } from "@expozr/core";

export default defineExpozrConfig({
  name: "simple-host",
  version: "1.0.0",
  expose: {
    // Currently just a consumer, but ready to expose modules if needed
  },
  metadata: {
    description: "Simple host example that consumes remote modules",
    author: "Expozr Team",
    license: "MIT",
    tags: ["host", "consumer", "example", "simple"],
  },
});
