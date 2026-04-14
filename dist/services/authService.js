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
exports.refreshToken = exports.verifyToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRepository_1 = require("../repositories/userRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const config_1 = __importDefault(require("../config/config"));
const login = (credentials) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = credentials;
        console.log('email', email);
        console.log('password', password);
        if (!email || !password) {
            return responseStatus_1.default.INVALID_ARGUMENT('Email and password are required');
        }
        const user = yield (0, userRepository_1.findUserByEmail)(email);
        if (!user || !user.password) {
            return responseStatus_1.default.UNAUTHENTICATED('Invalid email or password');
        }
        console.log('user : ', user);
        if (!user.is_active) {
            return responseStatus_1.default.UNAUTHENTICATED('Account is deactivated');
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
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
                role: user.role,
            },
        }, 'Login successful');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.login = login;
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecrete);
        const user = yield (0, userRepository_1.findUserById)(decoded.id);
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
exports.verifyToken = verifyToken;
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verificationResult = yield (0, exports.verifyToken)(token);
        if (verificationResult.code !== '200') {
            return verificationResult;
        }
        const user = verificationResult.data.user;
        const newToken = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
        }, config_1.default.jwtSecrete, { expiresIn: '1d' });
        return responseStatus_1.default.OK({ token: newToken, user }, 'Token refreshed successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.refreshToken = refreshToken;
