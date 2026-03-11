"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate and parse environment variables
const config = {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    host: process.env.DB_HOST || "localhost",
    dbPort: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "user_management",
    jwtSecrete: process.env.JWT_SECRET || "12345578"
};
exports.default = config;
