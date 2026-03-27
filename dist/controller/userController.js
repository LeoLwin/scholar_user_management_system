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
const express_1 = __importDefault(require("express"));
const userService_1 = require("../services/userService");
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
        const result = yield (0, userService_1.getUsers)(Number(current), Number(limit));
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
        const result = yield (0, userService_1.getUserById)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// POST /users
router.post("/", userValidator_1.CreateUserValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, userService_1.createUser)(req.body);
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
        const result = yield (0, userService_1.updateUser)(id, req.body);
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
        const result = yield (0, userService_1.deleteUser)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
