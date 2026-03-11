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
exports.deletePermission = exports.getPermissions = exports.createPermission = void 0;
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const createPermission = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `INSERT INTO permissions(name, feature_id) VALUES(?,?)`;
        const [result] = yield connection.query(query, [
            data.name,
            data.featureId,
        ]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.UNKNOWN("Failed to create permission");
        return responseStatus_1.default.OK(result, "Permission created");
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.createPermission = createPermission;
const getPermissions = (current, limit) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const offset = (current - 1) * limit;
        // total count
        const countQuery = `SELECT COUNT(*) AS total FROM permissions`;
        const [countRows] = yield connection.query(countQuery);
        const totalRecords = countRows[0].total;
        if (totalRecords === 0) {
            return responseStatus_1.default.OK({
                by: [],
                pagination: {
                    currentPage: current,
                    limit: limit,
                    totalRecords: 0,
                    totalPages: 0
                }
            });
        }
        const totalPages = Math.ceil(totalRecords / limit);
        // get paginated data
        const query = `
      SELECT 
        p.id, 
        p.name, 
        f.name AS feature
      FROM permissions p
      JOIN features f ON f.id = p.feature_id
      LIMIT ? OFFSET ?
    `;
        const [rows] = yield connection.query(query, [limit, offset]);
        return responseStatus_1.default.OK({
            by: rows,
            pagination: {
                currentPage: current,
                limit: limit,
                totalRecords,
                totalPages
            }
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.getPermissions = getPermissions;
const deletePermission = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `DELETE FROM permissions WHERE id=?`;
        const [result] = yield connection.query(query, [id]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.NOT_FOUND("Permission not found");
        return responseStatus_1.default.OK(result, "Permission deleted");
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.deletePermission = deletePermission;
