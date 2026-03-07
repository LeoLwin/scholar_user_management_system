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
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const tableName = "admin_users";
const list = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `SELECT * FROM ${tableName} LIMIT ?, ?`;
        const [rows] = yield connection.query(query, [offset, limit]);
        return responseStatus_1.default.OK(rows);
    }
    catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection) {
            yield connection.release();
        }
    }
});
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `SELECT * FROM ${tableName} WHERE id = ?`;
        const [rows] = yield connection.query(query, [id]);
        if (rows.length === 0) {
            return responseStatus_1.default.NOT_FOUND("Admin user not found.");
        }
        return responseStatus_1.default.OK(rows[0]);
    }
    catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection) {
            yield connection.release();
        }
    }
});
const create = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        const { name, username, role_id, phone, email, address, password, gender = "male", is_active = 1, } = data;
        connection = yield dbHelper_1.default.getConnection();
        const query = `INSERT INTO ${tableName} 
                   (name, username, role_id, phone, email, address, password, gender, is_active)
                   VALUES (?,?,?,?,?,?,?,?,?)`;
        const [result] = yield connection.query(query, [
            name,
            username,
            role_id,
            phone,
            email,
            address,
            password,
            gender,
            is_active,
        ]);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.UNKNOWN("Failed to create admin user.");
        }
        return responseStatus_1.default.OK({ id: result.insertId });
    }
    catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection) {
            yield connection.release();
        }
    }
});
const update = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (Object.keys(data).length === 0) {
        return responseStatus_1.default.INVALID_ARGUMENT("No data provided for update.");
    }
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const fields = Object.keys(data)
            .map((field) => `${field} = ?`)
            .join(", ");
        const values = Object.values(data);
        const query = `UPDATE ${tableName} SET ${fields} WHERE id = ?`;
        const [result] = yield connection.query(query, [...values, id]);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.NOT_FOUND("Admin user not found or no change made.");
        }
        return responseStatus_1.default.OK(result);
    }
    catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection) {
            yield connection.release();
        }
    }
});
const remove = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `DELETE FROM ${tableName} WHERE id = ?`;
        const [result] = yield connection.query(query, [id]);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.NOT_FOUND("Admin user not found.");
        }
        return responseStatus_1.default.OK(result);
    }
    catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection) {
            yield connection.release();
        }
    }
});
exports.default = {
    list,
    getById,
    create,
    update,
    remove,
};
