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
exports.PermissionService = void 0;
const permissionRepository_1 = require("../repositories/permissionRepository");
const featureRepository_1 = require("../repositories/featureRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
class PermissionService {
    constructor() {
        this.permissionRepository = new permissionRepository_1.PermissionRepository();
        this.featureRepository = new featureRepository_1.FeatureRepository();
    }
    createPermission(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.name || !data.featureId) {
                    return responseStatus_1.default.INVALID_ARGUMENT('Permission name and feature ID are required');
                }
                // Check if permission already exists
                const existingPermission = yield this.permissionRepository.findByName(data.name);
                if (existingPermission) {
                    return responseStatus_1.default.ALREADY_EXISTS('Permission already exists');
                }
                // Verify feature exists
                const feature = yield this.featureRepository.findById(data.featureId);
                if (!feature) {
                    return responseStatus_1.default.NOT_FOUND('Feature not found');
                }
                const permission = yield this.permissionRepository.create(data);
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
    }
    getPermissionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permission = yield this.permissionRepository.findById(id);
                if (!permission) {
                    return responseStatus_1.default.NOT_FOUND('Permission not found');
                }
                return responseStatus_1.default.OK({
                    id: permission.id,
                    name: permission.name,
                    featureId: permission.feature_id,
                    feature: permission.feature.name,
                    roleCount: permission.roles.length,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    getPermissions() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const [permissions, total] = yield Promise.all([
                    this.permissionRepository.findAll({ skip, take: limit }),
                    this.permissionRepository.count(),
                ]);
                const permissionData = permissions.map((permission) => ({
                    id: permission.id,
                    name: permission.name,
                    featureId: permission.feature_id,
                    feature: permission.feature.name,
                    roleCount: permission.roles.length,
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
    }
    updatePermission(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingPermission = yield this.permissionRepository.findById(id);
                if (!existingPermission) {
                    return responseStatus_1.default.NOT_FOUND('Permission not found');
                }
                // Check name uniqueness if name is being updated
                if (data.name && data.name !== existingPermission.name) {
                    const nameExists = yield this.permissionRepository.findByName(data.name);
                    if (nameExists) {
                        return responseStatus_1.default.ALREADY_EXISTS('Permission name already exists');
                    }
                }
                // Verify feature exists if featureId is being updated
                if (data.featureId) {
                    const feature = yield this.featureRepository.findById(data.featureId);
                    if (!feature) {
                        return responseStatus_1.default.NOT_FOUND('Feature not found');
                    }
                }
                const updatedPermission = yield this.permissionRepository.update(id, data);
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
    }
    deletePermission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permission = yield this.permissionRepository.findById(id);
                if (!permission) {
                    return responseStatus_1.default.NOT_FOUND('Permission not found');
                }
                // Check if permission is assigned to any roles
                if (permission.roles.length > 0) {
                    return responseStatus_1.default.FAILED_PRECONDITION('Cannot delete permission assigned to roles');
                }
                yield this.permissionRepository.delete(id);
                return responseStatus_1.default.OK(null, 'Permission deleted successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
}
exports.PermissionService = PermissionService;
