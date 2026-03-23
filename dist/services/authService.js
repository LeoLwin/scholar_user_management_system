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
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRepository_1 = require("../repositories/userRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const config_1 = __importDefault(require("../config/config"));
class AuthService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { email, password } = credentials;
                if (!email || !password) {
                    return responseStatus_1.default.INVALID_ARGUMENT('Email and password are required');
                }
                // Find user by email
                const user = yield this.userRepository.findByEmail(email);
                if (!user || !user.password) {
                    return responseStatus_1.default.UNAUTHENTICATED('Invalid email or password');
                }
                // Check if user is active
                if (!user.is_active) {
                    return responseStatus_1.default.UNAUTHENTICATED('Account is deactivated');
                }
                // Verify password
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    return responseStatus_1.default.UNAUTHENTICATED('Invalid email or password');
                }
                // Generate JWT token
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
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecrete);
                // Check if user still exists and is active
                const user = yield this.userRepository.findById(decoded.id);
                if (!user || !user.is_active) {
                    return responseStatus_1.default.UNAUTHENTICATED('Token is invalid');
                }
                return responseStatus_1.default.OK({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        roleId: user.role_id,
                        role: (_a = user.role) === null || _a === void 0 ? void 0 : _a.name,
                    },
                });
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    return responseStatus_1.default.UNAUTHENTICATED('Token has expired');
                }
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    return responseStatus_1.default.UNAUTHENTICATED('Invalid token');
                }
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    refreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First verify the existing token
                const verificationResult = yield this.verifyToken(token);
                if (verificationResult.code !== '200') {
                    return verificationResult;
                }
                const user = verificationResult.data.user;
                // Generate new token
                const newToken = jsonwebtoken_1.default.sign({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roleId: user.roleId,
                }, config_1.default.jwtSecrete, { expiresIn: '1d' });
                return responseStatus_1.default.OK({
                    token: newToken,
                    user,
                }, 'Token refreshed successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
}
exports.AuthService = AuthService;
