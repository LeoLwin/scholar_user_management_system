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
exports.getPermissionsByRole = exports.assignPermissionToRole = void 0;
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const assignPermissionToRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `INSERT INTO roles_permissions(role_id, permission_id) VALUES(?,?)`;
        const [result] = yield connection.query(query, [
            data.roleId,
            data.permissionId,
        ]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.UNKNOWN("Failed to assign permission");
        return responseStatus_1.default.OK(result, "Permission assigned to role");
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
exports.assignPermissionToRole = assignPermissionToRole;
const getPermissionsByRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `
      SELECT p.id, p.name, f.name as feature
      FROM roles_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN features f ON f.id = p.feature_id
      WHERE rp.role_id = ?
    `;
        const [rows] = yield connection.query(query, [roleId]);
        return responseStatus_1.default.OK(rows);
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
exports.getPermissionsByRole = getPermissionsByRole;
