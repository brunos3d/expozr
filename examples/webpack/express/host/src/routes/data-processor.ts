import { Router } from "express";
import { loadNodeUMDCargo } from "../libs/expozr/navigator";

const router: Router = Router();

// Data Processing - Uses dataProcessor UMD module
router.post("/process-data", async (req, res) => {
  try {
    console.log("📊 Loading DataProcessor cargo...");
    const dataProcessor = await loadNodeUMDCargo("./dataProcessor");

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

export { router };
