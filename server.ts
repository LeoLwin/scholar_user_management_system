import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import indexController from "./controller/indexController";
import config from "./config/config";
import { checkConnection } from "./helper/dbHelper";
import { initializeSystemData } from "./model/userModel";
import { ResponseStatus } from "./helper/responseStatus";


const startServer = async () => {
  try {
    // 1. Verify Database Connectivity first
    await checkConnection();
    console.log("Database connection established.");

    // 2. Seed/Initialize roles and admin user
    const initResult: ResponseStatus = await initializeSystemData();
    if (initResult.code !== "200") {
      throw new Error(initResult.message);
    }
    console.log("System initialization complete.");

    // 3. Setup Express
    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Welcome to Student Management System API");
    });

    app.use("/api", indexController);

    const PORT = config.port || 8000;
    app.listen(PORT, '127.0.0.1', () => {
      console.log("Server is listening on http://localhost:5000");
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit with failure
  }
};

startServer();