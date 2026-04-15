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
exports.getRolesNameAndValue = exports.getRolePermissionList = exports.removePermission = exports.assignPermission = exports.deleteRole = exports.updateRole = exports.getRoles = exports.getRoleById = exports.createRoleWithPermission = exports.createRole = void 0;
const roleRepository_1 = require("../repositories/roleRepository");
const permissionRepository_1 = require("../repositories/permissionRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const createRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!data.name) {
            return responseStatus_1.default.INVALID_ARGUMENT('Role name is required');
        }
        const existingRole = yield (0, roleRepository_1.findRoleByName)(data.name);
        if (existingRole) {
            return responseStatus_1.default.ALREADY_EXISTS('Role already exists');
        }
        const role = yield (0, roleRepository_1.createRole)(data);
        return responseStatus_1.default.OK({ id: role.id, name: role.name }, 'Role created successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.createRole = createRole;
const createRoleWithPermission = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!data.name || !data.permissionId) {
            return responseStatus_1.default.INVALID_ARGUMENT('Role name and permission ID are required');
        }
        const existingRole = yield (0, roleRepository_1.findRoleByName)(data.name);
        if (existingRole) {
            return responseStatus_1.default.ALREADY_EXISTS('Role already exists');
        }
        const permission = yield (0, permissionRepository_1.findPermissionById)(data.permissionId);
        if (!permission) {
            return responseStatus_1.default.NOT_FOUND('Permission not found');
        }
        const role = yield (0, roleRepository_1.createRole)({ name: data.name });
        yield (0, roleRepository_1.assignPermissionToRole)(role.id, data.permissionId);
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
exports.createRoleWithPermission = createRoleWithPermission;
const getRoleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield (0, roleRepository_1.findRoleById)(id);
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
exports.getRoleById = getRoleById;
const getRoles = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, filterName) {
    try {
        const skip = (page - 1) * limit;
        const whereClause = filterName
            ? { name: { contains: filterName } }
            : {};
        const [roles, total] = yield Promise.all([
            (0, roleRepository_1.findAllRoles)({ skip, take: limit, where: whereClause }),
            (0, roleRepository_1.countRoles)(whereClause),
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
exports.getRoles = getRoles;
const updateRole = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingRole = yield (0, roleRepository_1.findRoleById)(id);
        if (!existingRole) {
            return responseStatus_1.default.NOT_FOUND('Role not found');
        }
        if (data.name && data.name !== existingRole.name) {
            const nameExists = yield (0, roleRepository_1.findRoleByName)(data.name);
            if (nameExists) {
                return responseStatus_1.default.ALREADY_EXISTS('Role name already exists');
            }
        }
        const updatedRole = yield (0, roleRepository_1.updateRole)(id, data);
        return responseStatus_1.default.OK({ id: updatedRole.id, name: updatedRole.name }, 'Role updated successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.updateRole = updateRole;
const deleteRole = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield (0, roleRepository_1.findRoleById)(id);
        if (!role) {
            return responseStatus_1.default.NOT_FOUND('Role not found');
        }
        if (role.adminUsers.length > 0) {
            return responseStatus_1.default.FAILED_PRECONDITION('Cannot delete role with assigned users');
        }
        yield (0, roleRepository_1.deleteRole)(id);
        return responseStatus_1.default.OK(null, 'Role deleted successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.deleteRole = deleteRole;
const assignPermission = (roleId, permissionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield (0, roleRepository_1.findRoleById)(roleId);
        if (!role) {
            return responseStatus_1.default.NOT_FOUND('Role not found');
        }
        const permission = yield (0, permissionRepository_1.findPermissionById)(permissionId);
        if (!permission) {
            return responseStatus_1.default.NOT_FOUND('Permission not found');
        }
        const existingPermissions = yield (0, roleRepository_1.getRolePermissions)(roleId);
        const alreadyAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
        if (alreadyAssigned) {
            return responseStatus_1.default.ALREADY_EXISTS('Permission already assigned to role');
        }
        yield (0, roleRepository_1.assignPermissionToRole)(roleId, permissionId);
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
exports.assignPermission = assignPermission;
const removePermission = (roleId, permissionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield (0, roleRepository_1.findRoleById)(roleId);
        if (!role) {
            return responseStatus_1.default.NOT_FOUND('Role not found');
        }
        const existingPermissions = yield (0, roleRepository_1.getRolePermissions)(roleId);
        const isAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
        if (!isAssigned) {
            return responseStatus_1.default.NOT_FOUND('Permission not assigned to role');
        }
        yield (0, roleRepository_1.removePermissionFromRole)(roleId, permissionId);
        return responseStatus_1.default.OK({ roleId, permissionId }, 'Permission removed from role successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.removePermission = removePermission;
const getRolePermissionList = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield (0, roleRepository_1.findRoleById)(roleId);
        if (!role) {
            return responseStatus_1.default.NOT_FOUND('Role not found');
        }
        const permissions = role.permissions.map((rp) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            feature: rp.permission.feature.name,
        }));
        return responseStatus_1.default.OK({ roleId, roleName: role.name, permissions });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getRolePermissionList = getRolePermissionList;
const getRolesNameAndValue = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield (0, roleRepository_1.findAllRoles)({ skip: 0, take: 100 });
        return responseStatus_1.default.OK(roles.map((role) => ({ label: role.name, value: role.id })));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getRolesNameAndValue = getRolesNameAndValue;
