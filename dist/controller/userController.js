"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const UserModel = __importStar(require("../model/userModel"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const userValidator_1 = require("../validator/userValidator");
const commonValidator_1 = require("../validator/commonValidator");
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(responseStatus_1.default.OK("User endpoint is working"));
    }
    catch (err) {
        handleError(res, err);
    }
}));
// GET /users/list
router.get("/list", commonValidator_1.ListValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current = 1, limit = 10 } = req.query;
        const result = yield UserModel.getUsers(Number(current), Number(limit));
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// GET /users/:id
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Id is required."));
        }
        const result = yield UserModel.getUserById(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// POST /users
router.post("/", userValidator_1.CreateUserValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield UserModel.createUser(req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// PUT /users/:id
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Id is required."));
        }
        const result = yield UserModel.updateUser(id, req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// DELETE /users/:id
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Id is required."));
        }
        const result = yield UserModel.deleteUser(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
