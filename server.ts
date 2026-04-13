import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import indexController from "./controller/indexController";
import config from "./config/config";
import { prisma } from "./helper/dbHelper";
// import { ResponseStatus } from "./helper/responseStatus";
import { oidc } from "./provider";
import cors from "cors";
import cookieParser from 'cookie-parser';


const startServer = async () => {
  try {
    // 1. Verify Database Connectivity first
    await prisma.$connect();
    console.log("Database connection established.");

    // 2. Initialize Express app
    const app = express();
    app.use(cookieParser());
    app.set('trust proxy', true);

    console.log("System initialization complete.");
    app.use(cors({
      origin: [
        "http://localhost:5177",
        "http://localhost:5000",
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:5175",
        "http://localhost:5176"
      ],
      credentials: true, // SSO အတွက် Cookie ပါရမှာမို့လို့ ဒါလေး ထည့်ပေးပါ
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }));

    // 3. Setup Express
    app.use(express.json());


    app.get("/", (req, res) => {
      res.send("Welcome to User Management System API");
    });

    app.use('/oidc', oidc.callback());

    app.use("/api", indexController);

    const PORT = config.port || 8000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit with failure
  }
};

startServer();