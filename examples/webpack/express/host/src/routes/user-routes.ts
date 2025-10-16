import { Router } from "express";
import { loadCargo } from "../libs/expozr/navigator";

const router: Router = Router();

// User Operations - Uses userUtils UMD module
router.get("/users/:id", async (req, res) => {
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

// Advanced User Creation - Uses userUtils UMD module
router.post("/users", async (req, res) => {
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

export { router };
