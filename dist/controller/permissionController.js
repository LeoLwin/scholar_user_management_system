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
const PermissionModel = __importStar(require("../model/permissionModel"));
const RolePermissionModel = __importStar(require("../model/rolePermissionModel"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current = 1, limit = 10 } = req.query;
        const result = yield PermissionModel.getPermissions(Number(current), Number(limit));
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield PermissionModel.createPermission(req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const result = yield PermissionModel.deletePermission(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/roles-permissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        const { roleId, permissionIds } = req.body; // permissionIds = number[]
        console.log("Req.body : ", req.body);
        if (!roleId || !Array.isArray(permissionIds) || !permissionIds.length) {
            return res.status(400).json({ message: "roleId and permissionIds required" });
        }
        connection = yield dbHelper_1.default.getConnection();
        yield connection.beginTransaction();
        for (const permissionId of permissionIds) {
            const result = yield RolePermissionModel.assignPermissionToRole(connection, {
                roleId,
                permissionId,
            });
            if (result.code !== "200") {
                yield connection.rollback();
                return res.json(result);
            }
        }
        yield connection.commit();
        res.json({ code: "200", message: "Permissions assigned successfully" });
    }
    catch (err) {
        if (connection)
            yield connection.rollback();
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ code: "500", message: msg });
    }
    finally {
        if (connection)
            yield connection.release();
    }
}));
router.get("/roles-permissions/:roleId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleId = Number(req.params.roleId);
        const result = yield RolePermissionModel.getPermissionsByRole(roleId);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
