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
exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getRoles = exports.createRole = void 0;
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const rolePermissionModel_1 = require("./rolePermissionModel");
const createRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        yield connection.beginTransaction();
        const roleQuery = `INSERT INTO roles (name) VALUES (?)`;
        const [roleResult] = yield connection.query(roleQuery, [data.name]);
        if (roleResult.affectedRows === 0) {
            yield connection.rollback();
            return responseStatus_1.default.UNKNOWN("Failed to create role");
        }
        const roleId = roleResult.insertId;
        const permResult = yield (0, rolePermissionModel_1.assignPermissionToRole)(connection, {
            roleId,
            permissionId: data.permissionId,
        });
        if (permResult.code !== "200") {
            yield connection.rollback();
            return permResult;
        }
        yield connection.commit();
        return responseStatus_1.default.OK({ roleId, permissionId: data.permissionId }, "Role created successfully");
    }
    catch (err) {
        if (connection)
            yield connection.rollback();
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.createRole = createRole;
const getRoles = (current, limit) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const offset = (current - 1) * limit;
        console.log("hit the getRoles");
        // total count
        const countQuery = `SELECT COUNT(*) AS total FROM roles`;
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
        const query = `
      SELECT 
        r.id,
        r.name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
             'id', p.id, 
              'name', p.name, 
              'feature_id', p.feature_id
          )
        ) AS permissions
      FROM roles r
      LEFT JOIN roles_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permissions_id
      GROUP BY
        r.id,
        r.name
      LIMIT ? OFFSET ?
    `;
        const [rows] = yield connection.query(query, [
            limit,
            offset
        ]);
        return responseStatus_1.default.OK({
            by: rows,
            pagination: {
                currentPage: current,
                limit: limit,
                totalRecords: totalRecords,
                totalPages: totalPages
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
exports.getRoles = getRoles;
const getRoleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        // const query = `SELECT * FROM roles WHERE id=?`;
        const query = `
     SELECT 
        r.id,
        r.name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
             'id', p.id, 
              'name', p.name, 
              'feature_id', p.feature_id
          )
        ) AS permissions
      FROM roles r
      JOIN roles_permissions rp ON rp.role_id = r.id
      JOIN permissions p ON p.id = rp.permissions_id
      WHERE r.id = ?
      GROUP BY
        r.id,
        r.name`;
        const [rows] = yield connection.query(query, [id]);
        if (rows.length === 0)
            return responseStatus_1.default.NOT_FOUND("Role not found");
        return responseStatus_1.default.OK(rows[0]);
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
exports.getRoleById = getRoleById;
const updateRole = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `UPDATE roles SET name=? WHERE id=?`;
        const [result] = yield connection.query(query, [
            data.name,
            id,
        ]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.NOT_FOUND("Role not found");
        return responseStatus_1.default.OK(result, "Role updated");
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
exports.updateRole = updateRole;
const deleteRole = (id, permissionId) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        yield connection.beginTransaction();
        const deletePermResult = yield (0, rolePermissionModel_1.deleteAssignPermissionRole)(connection, {
            roleId: id,
            permissionId,
        });
        if (deletePermResult.code !== "200" && deletePermResult.code !== "404") {
            // 404 means no permissions existed, okay to continue
            yield connection.rollback();
            return deletePermResult;
        }
        const query = `DELETE FROM roles WHERE id=?`;
        const [result] = yield connection.query(query, [id]);
        if (result.affectedRows === 0) {
            yield connection.rollback();
            return responseStatus_1.default.NOT_FOUND("Role not found");
        }
        yield connection.commit();
        return responseStatus_1.default.OK(result, "Role deleted successfully");
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
exports.deleteRole = deleteRole;
