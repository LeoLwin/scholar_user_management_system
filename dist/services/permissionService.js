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
exports.getAvailablePermissionsForRole = exports.deletePermission = exports.updatePermission = exports.getPermissions = exports.getPermissionById = exports.createPermission = void 0;
const permissionRepository_1 = require("../repositories/permissionRepository");
const featureRepository_1 = require("../repositories/featureRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const createPermission = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!data.name || !data.featureId) {
            return responseStatus_1.default.INVALID_ARGUMENT('Permission name and feature ID are required');
        }
        const existingPermission = yield (0, permissionRepository_1.findPermissionByName)(data.name);
        if (existingPermission) {
            return responseStatus_1.default.ALREADY_EXISTS('Permission already exists');
        }
        const feature = yield (0, featureRepository_1.findFeatureById)(data.featureId);
        if (!feature) {
            return responseStatus_1.default.NOT_FOUND('Feature not found');
        }
        const permission = yield (0, permissionRepository_1.createPermission)(data);
        return responseStatus_1.default.OK({
            id: permission.id,
            name: permission.name,
            featureId: permission.feature_id,
            feature: permission.feature.name,
        }, 'Permission created successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.createPermission = createPermission;
const getPermissionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permission = yield (0, permissionRepository_1.findPermissionById)(id);
        if (!permission) {
            return responseStatus_1.default.NOT_FOUND('Permission not found');
        }
        const permissionData = {
            id: permission.id,
            name: permission.name,
            featureId: permission.feature_id,
            feature: permission.feature.name,
            roles: permission.roles.map((r) => ({
                id: r.role.id,
                name: r.role.name,
            })),
        };
        return responseStatus_1.default.OK(permissionData, "Permission fetched successfully");
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getPermissionById = getPermissionById;
const getPermissions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const [permissions, total] = yield Promise.all([
            (0, permissionRepository_1.findAllPermissions)({ skip, take: limit }),
            (0, permissionRepository_1.countPermissions)(),
        ]);
        console.log("Permissions : ");
        // const permissionData = permissions.map((permission: any) => ({
        //   id: permission.id,
        //   name: permission.name,
        //   featureId: permission.feature_id,
        //   feature: permission.feature.name,
        //   roleCount: permission.roles.length,
        // }));
        const permissionData = permissions.map((permission) => ({
            id: permission.id,
            name: permission.name,
            featureId: permission.feature_id,
            feature: permission.feature.name,
            roles: permission.roles.map((r) => ({
                id: r.role.id,
                name: r.role.name,
            })),
        }));
        return responseStatus_1.default.OK({
            permissions: permissionData,
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
exports.getPermissions = getPermissions;
const updatePermission = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingPermission = yield (0, permissionRepository_1.findPermissionById)(id);
        if (!existingPermission) {
            return responseStatus_1.default.NOT_FOUND('Permission not found');
        }
        if (data.name && data.name !== existingPermission.name) {
            const nameExists = yield (0, permissionRepository_1.findPermissionByName)(data.name);
            if (nameExists) {
                return responseStatus_1.default.ALREADY_EXISTS('Permission name already exists');
            }
        }
        if (data.featureId) {
            const feature = yield (0, featureRepository_1.findFeatureById)(data.featureId);
            if (!feature) {
                return responseStatus_1.default.NOT_FOUND('Feature not found');
            }
        }
        const updatedPermission = yield (0, permissionRepository_1.updatePermission)(id, data);
        return responseStatus_1.default.OK({
            id: updatedPermission.id,
            name: updatedPermission.name,
            featureId: updatedPermission.feature_id,
            feature: updatedPermission.feature.name,
        }, 'Permission updated successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.updatePermission = updatePermission;
const deletePermission = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permission = yield (0, permissionRepository_1.findPermissionById)(id);
        if (!permission) {
            return responseStatus_1.default.NOT_FOUND('Permission not found');
        }
        if (permission.roles.length > 0) {
            return responseStatus_1.default.FAILED_PRECONDITION('Cannot delete permission assigned to roles');
        }
        yield (0, permissionRepository_1.deletePermission)(id);
        return responseStatus_1.default.OK(null, 'Permission deleted successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.deletePermission = deletePermission;
const getAvailablePermissionsForRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unassignedPermissions = yield (0, permissionRepository_1.findUnassignedPermissions)(roleId);
        const permissionOptions = unassignedPermissions.map((p) => ({
            name: p.name,
            value: p.id,
        }));
        return responseStatus_1.default.OK(permissionOptions, "Available permissions fetched successfully");
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getAvailablePermissionsForRole = getAvailablePermissionsForRole;
