import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  host: string;
  dbPort: number;
  user: string;
  password: string;
  database: string;
  jwtSecrete : string
}



// Validate and parse environment variables
const config: Config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  host: process.env.DB_HOST || "localhost",
  dbPort: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "user_management",
  jwtSecrete: process.env.JWT_SECRET || "12345578" 
};

export default config;
