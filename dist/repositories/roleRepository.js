"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolePermissions = exports.removePermissionFromRole = exports.assignPermissionToRole = exports.countRoles = exports.deleteRole = exports.updateRole = exports.findAllRoles = exports.findRoleByName = exports.findRoleById = exports.createRole = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
const roleInclude = {
    adminUsers: true,
    permissions: {
        include: {
            permission: {
                include: { feature: true },
            },
        },
    },
};
const createRole = (data) => prismaClient_1.default.role.create({
    data: { name: data.name },
});
exports.createRole = createRole;
const findRoleById = (id) => prismaClient_1.default.role.findUnique({
    where: { id },
    include: roleInclude,
});
exports.findRoleById = findRoleById;
const findRoleByName = (name) => prismaClient_1.default.role.findFirst({
    where: { name },
    include: roleInclude,
});
exports.findRoleByName = findRoleByName;
const findAllRoles = (options) => prismaClient_1.default.role.findMany({
    skip: options === null || options === void 0 ? void 0 : options.skip,
    take: options === null || options === void 0 ? void 0 : options.take,
    // where: { ...options?.where, id: { not: 1 } },
    where: Object.assign({ id: { not: 1 } }, options === null || options === void 0 ? void 0 : options.where),
    include: Object.assign(Object.assign({}, roleInclude), options === null || options === void 0 ? void 0 : options.include),
});
exports.findAllRoles = findAllRoles;
const updateRole = (id, data) => prismaClient_1.default.role.update({
    where: { id },
    data: Object.assign({}, (data.name && { name: data.name })),
    include: roleInclude,
});
exports.updateRole = updateRole;
const deleteRole = (id) => prismaClient_1.default.role.delete({
    where: { id },
    include: roleInclude,
});
exports.deleteRole = deleteRole;
const countRoles = (where) => prismaClient_1.default.role.count({
    where: Object.assign({ id: { not: 1 } }, where)
});
exports.countRoles = countRoles;
const assignPermissionToRole = (roleId, permissionId) => prismaClient_1.default.rolePermission.create({
    data: {
        role_id: roleId,
        permissions_id: permissionId,
    },
});
exports.assignPermissionToRole = assignPermissionToRole;
const removePermissionFromRole = (roleId, permissionId) => prismaClient_1.default.rolePermission.delete({
    where: {
        role_id_permissions_id: {
            role_id: roleId,
            permissions_id: permissionId,
        },
    },
});
exports.removePermissionFromRole = removePermissionFromRole;
const getRolePermissions = (roleId) => prismaClient_1.default.rolePermission.findMany({
    where: { role_id: roleId },
    include: {
        permission: {
            include: { feature: true },
        },
    },
});
exports.getRolePermissions = getRolePermissions;
