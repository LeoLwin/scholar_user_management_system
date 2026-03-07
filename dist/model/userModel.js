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
exports.initializeSystemData = exports.findUserByEmail = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        const { name, username, email, password, roleId, phone, address, gender } = data;
        if (!name || !username || !email || !password || !roleId || !phone || !address) {
            return responseStatus_1.default.INVALID_ARGUMENT("Missing required fields");
        }
        connection = yield dbHelper_1.default.getConnection();
        const query = `
      INSERT INTO admin_users(name, username, email, password, role_id, phone, address, gender)
      VALUES(?,?,?,?,?,?,?,?)
    `;
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const [result] = yield connection.query(query, [
            name,
            username,
            email,
            hashedPassword,
            roleId,
            phone,
            address,
            gender || 'male',
        ]);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.UNKNOWN("Failed to create user.");
        }
        return responseStatus_1.default.OK({ insertId: result.insertId }, "User created");
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
exports.createUser = createUser;
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `
      SELECT u.id, u.name, u.username, u.email, u.phone, u.address, u.gender, r.name as role
      FROM admin_users u
      JOIN roles r ON r.id = u.role_id
    `;
        const [rows] = yield connection.query(query);
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
exports.getUsers = getUsers;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `SELECT id, name, username, email, role_id, phone, address, gender FROM admin_users WHERE id=?`;
        const [rows] = yield connection.query(query, [id]);
        if (rows.length === 0)
            return responseStatus_1.default.NOT_FOUND("User not found");
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
exports.getUserById = getUserById;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        const { name, username, email, roleId, phone, address, gender } = data;
        connection = yield dbHelper_1.default.getConnection();
        const query = `
      UPDATE admin_users
      SET name=?, username=?, email=?, role_id=?, phone=?, address=?, gender=?
      WHERE id=?
    `;
        const [result] = yield connection.query(query, [
            name,
            username,
            email,
            roleId,
            phone,
            address,
            gender,
            id,
        ]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.NOT_FOUND("User not found or no changes made");
        return responseStatus_1.default.OK(result, "User updated");
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
exports.updateUser = updateUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `DELETE FROM admin_users WHERE id=?`;
        const [result] = yield connection.query(query, [id]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.NOT_FOUND("User not found");
        return responseStatus_1.default.OK(result, "User deleted");
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
exports.deleteUser = deleteUser;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `
      SELECT id, name, username, email, password, role_id as roleId, phone, address, gender 
      FROM admin_users 
      WHERE email = ? LIMIT 1
    `;
        const [rows] = yield connection.query(query, [email]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    catch (err) {
        throw err;
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.findUserByEmail = findUserByEmail;
const initializeSystemData = () => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        yield connection.beginTransaction();
        const [roles] = yield connection.query("SELECT id FROM roles LIMIT 1");
        if (roles.length === 0) {
            console.log("Seed: Inserting Roles, Features, and Permissions...");
            yield connection.query("INSERT INTO roles (id, name) VALUES (1, 'admin'), (2, 'operator'), (3, 'Cashier')");
            yield connection.query("INSERT INTO features (id, name) VALUES (1, 'user'), (2, 'roles'), (3, 'product')");
            yield connection.query(`
        INSERT INTO permissions (id, name, feature_id) VALUES 
        (1, 'create', 1), (2, 'read', 1), (3, 'update', 1), (4, 'delete', 1),
        (5, 'create', 2), (6, 'read', 2), (7, 'update', 2), (8, 'delete', 2)
      `);
            yield connection.query(`
        INSERT INTO roles_permissions (role_id, permissions_id) VALUES 
        (1, '1'), (1, '2'), (1, '3'), (1, '4'), 
        (1, '5'), (1, '6'), (1, '7'), (1, '8')
      `);
        }
        const [adminUser] = yield connection.query("SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1");
        if (adminUser.length === 0) {
            console.log("Seed:");
            const saltRounds = 10;
            const hashedPassword = yield bcrypt_1.default.hash('admin123', saltRounds);
            const insertUserQuery = `
        INSERT INTO admin_users(name, username, email, password, role_id, phone, address, gender)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
            console.log();
            yield connection.query(insertUserQuery, [
                'Admin',
                'admin',
                'admin@system.com',
                hashedPassword,
                1,
                '091234567',
                'System Office',
                'male'
            ]);
        }
        yield connection.commit();
        return responseStatus_1.default.OK(null, "System initialized successfully");
    }
    catch (err) {
        if (connection)
            yield connection.rollback();
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Initialization Error:", msg);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.initializeSystemData = initializeSystemData;
