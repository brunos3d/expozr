// Express Host Server with UMD Module Federation
import cors from "cors";
import path from "path";
import express from "express";
import type { Express } from "express";

import { loadCargo } from "./navigator";

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

// Route 1: Health Check - Simple route without UMD loading
app.get("/api/health", (req, res) => {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      server: "express-host-server",
      port: PORT,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    };

    console.log("💚 Health check requested");
    res.json(healthData);
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Route 2: User Operations - Uses userUtils UMD module
app.get("/api/users/:id", async (req, res) => {
  try {
    console.log("👤 Loading UserUtils cargo...");
    const userUtils = await loadCargo("./userUtils");

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid user ID",
        message: "User ID must be a number",
      });
    }

    const userData = userUtils.getUserData(userId);
    const validation = userUtils.validateUser(userData);

    const response = {
      route: "/api/users/:id",
      cargo: "userUtils",
      userData,
      validation,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ User ${userId} data retrieved successfully`);
    res.json(response);
  } catch (error) {
    console.error("❌ User operation failed:", error);
    res.status(500).json({
      error: "User operation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Route 3: Math Operations - Uses mathUtils UMD module
app.post("/api/calculate", async (req, res) => {
  try {
    console.log("🔢 Loading MathUtils cargo...");
    const mathUtils = await loadCargo("./mathUtils");

    const { operation, operands } = req.body;

    if (!operation || !Array.isArray(operands)) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Required: operation (string) and operands (number array)",
      });
    }

    const calculation = mathUtils.calculate(operation, ...operands);
    const stats = mathUtils.generateStats(operands);
    const formattedResult = mathUtils.formatNumber(calculation.result);

    const response = {
      route: "/api/calculate",
      cargo: "mathUtils",
      calculation,
      statistics: stats,
      formattedResult,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `✅ Calculation completed: ${operation} = ${calculation.result}`
    );
    res.json(response);
  } catch (error) {
    console.error("❌ Math operation failed:", error);
    res.status(500).json({
      error: "Math operation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Route 4: Data Processing - Uses dataProcessor UMD module
app.post("/api/process-data", async (req, res) => {
  try {
    console.log("📊 Loading DataProcessor cargo...");
    const dataProcessor = await loadCargo("./dataProcessor");

    const { data, type = "generic" } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Data must be an array",
      });
    }

    const processed = dataProcessor.processData(data, type);
    const transformed = dataProcessor.transformData(processed.results, {
      limit: 10,
      sortBy: "timestamp",
    });
    const aggregated = dataProcessor.aggregateData(transformed);

    const response = {
      route: "/api/process-data",
      cargo: "dataProcessor",
      original: { count: data.length, sample: data.slice(0, 3) },
      processed,
      transformed: {
        count: transformed.length,
        sample: transformed.slice(0, 3),
      },
      aggregated,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Data processing completed: ${data.length} records`);
    res.json(response);
  } catch (error) {
    console.error("❌ Data processing failed:", error);
    res.status(500).json({
      error: "Data processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Route 5: Advanced User Creation - Uses userUtils UMD module
app.post("/api/users", async (req, res) => {
  try {
    console.log("👤 Loading UserUtils cargo for user creation...");
    const userUtils = await loadCargo("./userUtils");

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Required: name and email",
      });
    }

    const newUser = userUtils.createUser(name, email);
    const validation = userUtils.validateUser(newUser);

    const response = {
      route: "/api/users",
      cargo: "userUtils",
      operation: "create",
      user: newUser,
      validation,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `✅ User created successfully: ${newUser.name} (ID: ${newUser.id})`
    );
    res.status(201).json(response);
  } catch (error) {
    console.error("❌ User creation failed:", error);
    res.status(500).json({
      error: "User creation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

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
