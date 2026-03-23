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
exports.RoleService = void 0;
const roleRepository_1 = require("../repositories/roleRepository");
const permissionRepository_1 = require("../repositories/permissionRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
class RoleService {
    constructor() {
        this.roleRepository = new roleRepository_1.RoleRepository();
        this.permissionRepository = new permissionRepository_1.PermissionRepository();
    }
    createRole(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.name) {
                    return responseStatus_1.default.INVALID_ARGUMENT('Role name is required');
                }
                // Check if role already exists
                const existingRole = yield this.roleRepository.findByName(data.name);
                if (existingRole) {
                    return responseStatus_1.default.ALREADY_EXISTS('Role already exists');
                }
                const role = yield this.roleRepository.create(data);
                return responseStatus_1.default.OK({
                    id: role.id,
                    name: role.name,
                }, 'Role created successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    createRoleWithPermission(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.name || !data.permissionId) {
                    return responseStatus_1.default.INVALID_ARGUMENT('Role name and permission ID are required');
                }
                // Check if role already exists
                const existingRole = yield this.roleRepository.findByName(data.name);
                if (existingRole) {
                    return responseStatus_1.default.ALREADY_EXISTS('Role already exists');
                }
                // Verify permission exists
                const permission = yield this.permissionRepository.findById(data.permissionId);
                if (!permission) {
                    return responseStatus_1.default.NOT_FOUND('Permission not found');
                }
                // Create role and assign permission in transaction
                const role = yield this.roleRepository.create({ name: data.name });
                yield this.roleRepository.assignPermission(role.id, data.permissionId);
                return responseStatus_1.default.OK({
                    roleId: role.id,
                    permissionId: data.permissionId,
                    role: role.name,
                    permission: permission.name,
                }, 'Role created and permission assigned successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    getRoleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield this.roleRepository.findById(id);
                if (!role) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                const permissions = role.permissions.map((rp) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    feature: rp.permission.feature.name,
                }));
                return responseStatus_1.default.OK({
                    id: role.id,
                    name: role.name,
                    userCount: role.adminUsers.length,
                    permissions,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    getRoles() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const [roles, total] = yield Promise.all([
                    this.roleRepository.findAll({ skip, take: limit }),
                    this.roleRepository.count(),
                ]);
                const roleData = roles.map((role) => ({
                    id: role.id,
                    name: role.name,
                    userCount: role.adminUsers.length,
                    permissions: role.permissions.map((rp) => ({
                        id: rp.permission.id,
                        name: rp.permission.name,
                        feature: rp.permission.feature.name,
                    })),
                }));
                return responseStatus_1.default.OK({
                    roles: roleData,
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
    updateRole(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingRole = yield this.roleRepository.findById(id);
                if (!existingRole) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                // Check name uniqueness if name is being updated
                if (data.name && data.name !== existingRole.name) {
                    const nameExists = yield this.roleRepository.findByName(data.name);
                    if (nameExists) {
                        return responseStatus_1.default.ALREADY_EXISTS('Role name already exists');
                    }
                }
                const updatedRole = yield this.roleRepository.update(id, data);
                return responseStatus_1.default.OK({
                    id: updatedRole.id,
                    name: updatedRole.name,
                }, 'Role updated successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    deleteRole(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield this.roleRepository.findById(id);
                if (!role) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                // Check if role has users
                if (role.adminUsers.length > 0) {
                    return responseStatus_1.default.FAILED_PRECONDITION('Cannot delete role with assigned users');
                }
                yield this.roleRepository.delete(id);
                return responseStatus_1.default.OK(null, 'Role deleted successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    assignPermissionToRole(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify role exists
                const role = yield this.roleRepository.findById(roleId);
                if (!role) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                // Verify permission exists
                const permission = yield this.permissionRepository.findById(permissionId);
                if (!permission) {
                    return responseStatus_1.default.NOT_FOUND('Permission not found');
                }
                // Check if permission is already assigned
                const existingPermissions = yield this.roleRepository.getPermissions(roleId);
                const alreadyAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
                if (alreadyAssigned) {
                    return responseStatus_1.default.ALREADY_EXISTS('Permission already assigned to role');
                }
                yield this.roleRepository.assignPermission(roleId, permissionId);
                return responseStatus_1.default.OK({
                    roleId,
                    permissionId,
                    role: role.name,
                    permission: permission.name,
                }, 'Permission assigned to role successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    removePermissionFromRole(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify role exists
                const role = yield this.roleRepository.findById(roleId);
                if (!role) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                // Check if permission is assigned
                const existingPermissions = yield this.roleRepository.getPermissions(roleId);
                const isAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
                if (!isAssigned) {
                    return responseStatus_1.default.NOT_FOUND('Permission not assigned to role');
                }
                yield this.roleRepository.removePermission(roleId, permissionId);
                return responseStatus_1.default.OK({
                    roleId,
                    permissionId,
                }, 'Permission removed from role successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
    getRolePermissions(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield this.roleRepository.findById(roleId);
                if (!role) {
                    return responseStatus_1.default.NOT_FOUND('Role not found');
                }
                const permissions = role.permissions.map((rp) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    feature: rp.permission.feature.name,
                }));
                return responseStatus_1.default.OK({
                    roleId,
                    roleName: role.name,
                    permissions,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return responseStatus_1.default.UNKNOWN(message);
            }
        });
    }
}
exports.RoleService = RoleService;
