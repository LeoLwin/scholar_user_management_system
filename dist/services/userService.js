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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUsers = exports.getUserById = exports.login = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
const roleRepository_1 = require("../repositories/roleRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const config_1 = __importDefault(require("../config/config"));
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("data", data);
        if (!data.name || !data.email ||
            !data.roleId || !data.phone || !data.address) {
            return responseStatus_1.default.INVALID_ARGUMENT('Missing required fields');
        }
        const existingUser = yield (0, userRepository_1.findUserByEmail)(data.email);
        if (existingUser) {
            return responseStatus_1.default.ALREADY_EXISTS('Email already exists');
        }
        const existingUsername = yield (0, userRepository_1.findUserByUsername)(data.username);
        if (existingUsername) {
            return responseStatus_1.default.ALREADY_EXISTS('Username already exists');
        }
        const role = yield (0, roleRepository_1.findRoleById)(data.roleId);
        if (!role) {
            return responseStatus_1.default.NOT_FOUND('Role not found');
        }
        const hashedPassword = yield bcrypt_1.default.hash(config_1.default.defaultPassword, 10);
        const user = yield (0, userRepository_1.createUser)(Object.assign(Object.assign({}, data), { password: hashedPassword }));
        return responseStatus_1.default.OK({
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.role_id,
            role: user.role.name,
        }, 'User created successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.createUser = createUser;
const login = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!data.email || !data.password) {
            return responseStatus_1.default.INVALID_ARGUMENT('Email and password are required');
        }
        const user = yield (0, userRepository_1.findUserByEmail)(data.email);
        if (!user || !user.password) {
            return responseStatus_1.default.UNAUTHENTICATED('Invalid email or password');
        }
        const isMatch = yield bcrypt_1.default.compare(data.password, user.password);
        if (!isMatch) {
            return responseStatus_1.default.UNAUTHENTICATED('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.role_id,
        }, config_1.default.jwtSecrete, { expiresIn: '1d' });
        return responseStatus_1.default.OK({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roleId: user.role_id,
                role: (_a = user.role) === null || _a === void 0 ? void 0 : _a.name,
            },
        }, 'Login successful');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.login = login;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield (0, userRepository_1.findUserById)(id);
        if (!user) {
            return responseStatus_1.default.NOT_FOUND('User not found');
        }
        return responseStatus_1.default.OK({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            roleId: user.role_id,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            isActive: user.is_active,
            role: (_a = user.role) === null || _a === void 0 ? void 0 : _a.name,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getUserById = getUserById;
const getUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const [users, total] = yield Promise.all([
            (0, userRepository_1.findAllUsers)({ skip, take: limit }),
            (0, userRepository_1.countUsers)(),
        ]);
        const userData = users.map((user) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            roleId: user.role_id,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            isActive: user.is_active,
            role: user.role,
        }));
        return responseStatus_1.default.OK({
            users: userData,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit,
                current: page
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getUsers = getUsers;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const existingUser = yield (0, userRepository_1.findUserById)(id);
        if (!existingUser) {
            return responseStatus_1.default.NOT_FOUND('User not found');
        }
        if (data.email && data.email !== existingUser.email) {
            const emailExists = yield (0, userRepository_1.findUserByEmail)(data.email);
            if (emailExists) {
                return responseStatus_1.default.ALREADY_EXISTS('Email already exists');
            }
        }
        if (data.username && data.username !== existingUser.username) {
            const usernameExists = yield (0, userRepository_1.findUserByUsername)(data.username);
            if (usernameExists) {
                return responseStatus_1.default.ALREADY_EXISTS('Username already exists');
            }
        }
        if (data.roleId) {
            const role = yield (0, roleRepository_1.findRoleById)(data.roleId);
            if (!role) {
                return responseStatus_1.default.NOT_FOUND('Role not found');
            }
        }
        const { isActive } = data, rest = __rest(data, ["isActive"]);
        const updateData = Object.assign(Object.assign({}, rest), { is_active: isActive === true || isActive === 'true' });
        console.log("updateUserData : ", updateData);
        const updatedUser = yield (0, userRepository_1.updateUser)(id, updateData);
        return responseStatus_1.default.OK({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            roleId: updatedUser.role_id,
            role: (_a = updatedUser.role) === null || _a === void 0 ? void 0 : _a.name,
        }, 'User updated successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.updateUser = updateUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, userRepository_1.findUserById)(id);
        if (!user) {
            return responseStatus_1.default.NOT_FOUND('User not found');
        }
        yield (0, userRepository_1.deleteUser)(id);
        return responseStatus_1.default.OK(null, 'User deleted successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.deleteUser = deleteUser;
