// Express Host Server with UMD Module Federation
import cors from "cors";
import path from "path";
import express from "express";
import type { Express } from "express";

import { router as healthCheckRouter } from "./routes/health-check";
import { router as userRoutesRouter } from "./routes/user-routes";
import { router as mathUtilsRouter } from "./routes/math-utils";
import { router as dataProcessorRouter } from "./routes/data-processor";

const app: Express = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Mount routers
app.use("/api", healthCheckRouter);
app.use("/api", userRoutesRouter);
app.use("/api", mathUtilsRouter);
app.use("/api", dataProcessorRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Express Host Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:
  
  GET  /                     - Main HTML interface
  GET  /api/health           - Health check (no UMD loading)
  GET  /api/users/:id        - Get user data (uses userUtils UMD)
  POST /api/calculate        - Math operations (uses mathUtils UMD)
  POST /api/process-data     - Data processing (uses dataProcessor UMD)
  POST /api/users            - Create user (uses userUtils UMD)
  
  🎯 UMD Modules loaded from: http://localhost:5001
  `);
});

export default app;
