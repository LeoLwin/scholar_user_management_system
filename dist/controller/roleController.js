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
const roleService_1 = require("../services/roleService");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const roleValidator_1 = require("../validator/roleValidator");
const commonValidator_1 = require("../validator/commonValidator");
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/list", commonValidator_1.ListValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Hit the role controller");
        const { current = 1, limit = 10 } = req.query;
        const result = yield (0, roleService_1.getRoles)(Number(current), Number(limit));
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Id is required."));
        }
        const result = yield (0, roleService_1.getRoleById)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/", roleValidator_1.CreateRoleValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, roleService_1.createRole)(req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/:id/permissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = Number(req.params.id);
        const { permissionId } = req.body;
        if (!roleId || !permissionId) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Role ID and Permission ID are required"));
        }
        const result = yield (0, roleService_1.assignPermission)(roleId, permissionId);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.delete("/:id/permissions/:permissionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = Number(req.params.id);
        const permissionId = Number(req.params.permissionId);
        if (!roleId || !permissionId) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Role ID and Permission ID are required"));
        }
        const result = yield (0, roleService_1.removePermission)(roleId, permissionId);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/:id/permissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = Number(req.params.id);
        if (!roleId) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Role ID is required"));
        }
        const result = yield (0, roleService_1.getRolePermissionList)(roleId);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Id is required."));
        }
        const result = yield (0, roleService_1.updateRole)(id, req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Id is required."));
        }
        const result = yield (0, roleService_1.deleteRole)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
