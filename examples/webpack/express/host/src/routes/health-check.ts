import { Router } from "express";

const router: Router = Router();

// Health Check - Simple route without UMD loading
router.get("/health", (req, res) => {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      server: "express-host-server",
      port: 5000,
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

export { router };
