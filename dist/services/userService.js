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
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
const roleRepository_1 = require("../repositories/roleRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const config_1 = __importDefault(require("../config/config"));
class UserService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
        this.roleRepository = new roleRepository_1.RoleRepository();
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate required fields
                if (!data.name || !data.username || !data.email || !data.password ||
                    !data.roleId || !data.phone || !data.address) {
                    return responseStatus_1.default.INVALID_ARGUMENT('Missing required fields');
                }
                // Check if email already exists
                const existingUser = yield this.userRepository.findByEmail(data.email);
                if (existingUser) {
                    return responseStatus_1.default.ALREADY_EXISTS('Email already exists');
                }
                // Check if username already exists
                const existingUsername = yield this.userRepository.findByUsername(data.username);
                if (existingUsername) {
                    return responseStatus_1.default.ALREADY_EXISTS('Username already exists');
                }
                // Verify role exists
                const role = yield this.roleRepository.findById(data.roleId);
                if (!role) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                // Hash password
                const saltRounds = 10;
                const hashedPassword = yield bcrypt_1.default.hash(data.password, saltRounds);
                const userData = Object.assign(Object.assign({}, data), { password: hashedPassword });
                const user = yield this.userRepository.create(userData);
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
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!data.email || !data.password) {
                    return responseStatus_1.default.INVALID_ARGUMENT('Email and password are required');
                }
                const user = yield this.userRepository.findByEmail(data.email);
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
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield this.userRepository.findById(id);
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
    }
    getUsers() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const [users, total] = yield Promise.all([
                    this.userRepository.findAll({ skip, take: limit }),
                    this.userRepository.count(),
                ]);
                const userData = users.map((user) => {
                    var _a;
                    return ({
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
                });
                return responseStatus_1.default.OK({
                    users: userData,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalRecords: total,
                        limit,
                    },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Check if user exists
                const existingUser = yield this.userRepository.findById(id);
                if (!existingUser) {
                    return responseStatus_1.default.NOT_FOUND('User not found');
                }
                // Check email uniqueness if email is being updated
                if (data.email && data.email !== existingUser.email) {
                    const emailExists = yield this.userRepository.findByEmail(data.email);
                    if (emailExists) {
                        return responseStatus_1.default.ALREADY_EXISTS('Email already exists');
                    }
                }
                // Check username uniqueness if username is being updated
                if (data.username && data.username !== existingUser.username) {
                    const usernameExists = yield this.userRepository.findByUsername(data.username);
                    if (usernameExists) {
                        return responseStatus_1.default.ALREADY_EXISTS('Username already exists');
                    }
                }
                // Verify role exists if roleId is being updated
                if (data.roleId) {
                    const role = yield this.roleRepository.findById(data.roleId);
                    if (!role) {
                        return responseStatus_1.default.NOT_FOUND('Role not found');
                    }
                }
                const updatedUser = yield this.userRepository.update(id, data);
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
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findById(id);
                if (!user) {
                    return responseStatus_1.default.NOT_FOUND('User not found');
                }
                yield this.userRepository.delete(id);
                return responseStatus_1.default.OK(null, 'User deleted successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
}
exports.UserService = UserService;
