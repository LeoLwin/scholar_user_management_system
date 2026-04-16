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
const permissionService_1 = require("../services/permissionService");
const roleService_1 = require("../services/roleService");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current = 1, limit = 10 } = req.query;
        const result = yield (0, permissionService_1.getPermissions)(Number(current), Number(limit));
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/name-value", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Call name-value");
    try {
        const { roleId } = req.query;
        console.log("RoleId : ", roleId);
        if (!roleId) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Role's id is required!"));
        }
        const result = yield (0, permissionService_1.getAvailablePermissionsForRole)(Number(roleId));
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
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Permission ID is required"));
        }
        const result = yield (0, permissionService_1.getPermissionById)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, permissionService_1.createPermission)(req.body);
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
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Permission ID is required"));
        }
        const result = yield (0, permissionService_1.updatePermission)(id, req.body);
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
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Permission ID is required"));
        }
        const result = yield (0, permissionService_1.deletePermission)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// Bulk assign permissions to role
router.post("/roles-permissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permissionIds } = req.body; // permissionIds = number[]
        if (!roleId || !Array.isArray(permissionIds) || !permissionIds.length) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("roleId and permissionIds are required"));
        }
        // Assign permissions one by one
        const results = [];
        for (const permissionId of permissionIds) {
            const result = yield (0, roleService_1.assignPermission)(roleId, permissionId);
            results.push(result);
            // If any assignment fails, we could handle it here
        }
        res.json(responseStatus_1.default.OK({
            roleId,
            assignedPermissions: permissionIds.length,
            // results
        }, "Permissions assigned successfully"));
    }
    catch (err) {
        handleError(res, err);
    }
}));
// Get permissions by role
router.get("/roles-permissions/:roleId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = Number(req.params.roleId);
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
router.put("/update-permission/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { name, featureId, roleIds } = req.body;
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Permission ID is required"));
        }
        if (!name || !featureId || !Array.isArray(roleIds)) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Required fields are missing or invalid"));
        }
        const result = yield (0, permissionService_1.updatePermissionService)(id, { name, featureId, roleIds });
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
