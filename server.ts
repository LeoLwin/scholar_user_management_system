import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import indexController from "./controller/indexController";
import config from "./config/config";
import { prisma } from "./helper/dbHelper";
import { ResponseStatus } from "./helper/responseStatus";


const startServer = async () => {
  try {
    // 1. Verify Database Connectivity first
    await prisma.$connect();
    console.log("Database connection established.");

    // 2. Initialize Express app
    const app = express();
    console.log("System initialization complete.");

    // 3. Setup Express
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Welcome to User Management System API");
    });

    app.use("/api", indexController);

    const PORT = config.port || 8000;
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit with failure
  }
};

startServer();