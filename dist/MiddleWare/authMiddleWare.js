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
exports.authTokenValidator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const config_1 = __importDefault(require("../config/config"));
const authTokenValidator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hit authTokenValidator");
    try {
        const authHeaderRaw = req.headers.authorization || req.headers.Authorization;
        // console.log("authHeaderRaw : ", authHeaderRaw);
        // Normalize to a string (handles string[] case)
        const authHeader = Array.isArray(authHeaderRaw)
            ? authHeaderRaw[0]
            : authHeaderRaw;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json(responseStatus_1.default.UNAUTHENTICATED("No token provided"));
        }
        // Extract the token part
        const token = authHeader.split(" ")[1];
        console.log("Token : ", token);
        if (!token) {
            return res.json(responseStatus_1.default.PERMISSION_DENIED("Invalid token format"));
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecrete || "secret");
        req.user = decoded;
        // Pass control to the next middleware
        console.log("pass");
        next();
    }
    catch (error) {
        const err = error;
        console.log("Error : ", err);
        res.json(responseStatus_1.default.PERMISSION_DENIED(err.message));
    }
});
exports.authTokenValidator = authTokenValidator;
