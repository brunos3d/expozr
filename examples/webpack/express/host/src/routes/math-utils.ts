import { Router } from "express";
import { loadCargo } from "../libs/expozr/navigator";

const router: Router = Router();

// Math Operations - Uses mathUtils UMD module
router.post("/calculate", async (req, res) => {
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

export { router };
