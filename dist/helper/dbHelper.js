"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const config_1 = __importDefault(require("../config/config"));
const pool = mysql2_1.default.createPool({
    connectionLimit: 200, //important
    waitForConnections: true,
    host: config_1.default.host,
    port: config_1.default.dbPort,
    user: config_1.default.user,
    password: config_1.default.password,
    database: config_1.default.database,
    debug: false,
    charset: "utf8mb4"
});
// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection)
        connection.release();
    return;
});
const checkConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield pool.promise().getConnection();
        console.log('Connected to MySQL database.');
        connection.release(); // Always release the connection back to the pool
    }
    catch (err) {
        console.error('Database connection failed:', err.message);
    }
});
exports.checkConnection = checkConnection;
// use ES module export syntax so we don’t overwrite named exports above
exports.default = pool.promise();
