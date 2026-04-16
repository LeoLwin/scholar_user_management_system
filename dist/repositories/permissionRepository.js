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
exports.findUnassignedPermissions = exports.countPermissions = exports.deletePermission = exports.updatePermission = exports.findAllPermissions = exports.findPermissionByName = exports.findPermissionById = exports.createPermission = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
const permissionInclude = {
    feature: true,
    roles: { include: { role: true } },
};
const createPermission = (data) => prismaClient_1.default.permission.create({
    data: {
        name: data.name,
        feature_id: data.featureId,
    },
    include: permissionInclude,
});
exports.createPermission = createPermission;
const findPermissionById = (id) => prismaClient_1.default.permission.findUnique({
    where: { id },
    include: permissionInclude,
});
exports.findPermissionById = findPermissionById;
const findPermissionByName = (name) => prismaClient_1.default.permission.findFirst({
    where: { name },
    include: permissionInclude,
});
exports.findPermissionByName = findPermissionByName;
const findAllPermissions = (options) => prismaClient_1.default.permission.findMany({
    skip: options === null || options === void 0 ? void 0 : options.skip,
    take: options === null || options === void 0 ? void 0 : options.take,
    where: options === null || options === void 0 ? void 0 : options.where,
    include: Object.assign(Object.assign({}, permissionInclude), options === null || options === void 0 ? void 0 : options.include),
});
exports.findAllPermissions = findAllPermissions;
const updatePermission = (id, data) => prismaClient_1.default.permission.update({
    where: { id },
    data: Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.featureId && { feature_id: data.featureId })),
    include: permissionInclude,
});
exports.updatePermission = updatePermission;
const deletePermission = (id) => prismaClient_1.default.permission.delete({
    where: { id },
    include: permissionInclude,
});
exports.deletePermission = deletePermission;
const countPermissions = (where) => prismaClient_1.default.permission.count({ where });
exports.countPermissions = countPermissions;
// permissions.repository.ts
const findUnassignedPermissions = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.permission.findMany({
        where: {
            roles: {
                none: {
                    role_id: roleId,
                },
            },
        },
    });
});
exports.findUnassignedPermissions = findUnassignedPermissions;
