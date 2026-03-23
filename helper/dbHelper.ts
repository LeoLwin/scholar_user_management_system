// import mysql from "mysql2";
// import config from "../config/config";

// const pool = mysql.createPool({
//     connectionLimit: 200, //important
//     waitForConnections: true,
//     host: config.host,
//     port: config.dbPort,
//     user: config.user,
//     password: config.password,
//     database: config.database,
//     debug: false,
//     charset: "utf8mb4"
// });

// // Ping database to check for common exception errors.
// pool.getConnection((err: any, connection: any) => {
//     if (err) {
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('Database connection was closed.');
//         }
//         if (err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('Database has too many connections.');
//         }
//         if (err.code === 'ECONNREFUSED') {
//             console.error('Database connection was refused.');
//         }
//     }

//     if (connection) connection.release();

//     return;
// })

// export const checkConnection = async () => {
//     try {
//         const connection = await pool.promise().getConnection();
//         console.log('Connected to MySQL database.');
//         connection.release(); // Always release the connection back to the pool
//     } catch (err: any) {
//         console.error('Database connection failed:', err.message);
//     }
// }

// // use ES module export syntax so we don’t overwrite named exports above
// export default pool.promise();


import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };