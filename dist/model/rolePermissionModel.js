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
exports.getPermissionsByRole = exports.deleteAssignPermissionRole = exports.assignPermissionToRole = void 0;
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const assignPermissionToRole = (connection, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      INSERT INTO roles_permissions (role_id, permissions_id)
      VALUES (?, ?)
    `;
        const [result] = yield connection.query(query, [
            data.roleId,
            data.permissionId,
        ]);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.UNKNOWN("Failed to assign permission");
        }
        return responseStatus_1.default.OK(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
});
exports.assignPermissionToRole = assignPermissionToRole;
const deleteAssignPermissionRole = (connection, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = `DELETE FROM roles_permissions WHERE role_id = ?`;
        const queryParams = [data.roleId];
        if (data.permissionId !== undefined) {
            query += ` AND permission_id = ?`;
            queryParams.push(data.permissionId);
        }
        const [result] = yield connection.query(query, queryParams);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.NOT_FOUND("No permission found to delete");
        }
        return responseStatus_1.default.OK({ affectedRows: result.affectedRows }, "Role permission deleted successfully");
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
});
exports.deleteAssignPermissionRole = deleteAssignPermissionRole;
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
