"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countUsers = exports.deleteUser = exports.updateUser = exports.findAllUsers = exports.findUserByUsername = exports.findUserByEmail = exports.findUserById = exports.createUser = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
const createUser = (data) => prismaClient_1.default.adminUser.create({
    data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role_id: data.roleId,
        phone: data.phone,
        address: data.address,
        gender: data.gender || 'male',
    },
    include: { role: true },
});
exports.createUser = createUser;
const findUserById = (id) => prismaClient_1.default.adminUser.findUnique({
    where: { id },
    include: { role: true },
});
exports.findUserById = findUserById;
const findUserByEmail = (email) => prismaClient_1.default.adminUser.findUnique({
    where: { email },
    include: { role: true },
});
exports.findUserByEmail = findUserByEmail;
const findUserByUsername = (username) => prismaClient_1.default.adminUser.findFirst({
    where: { username },
    include: { role: true },
});
exports.findUserByUsername = findUserByUsername;
const findAllUsers = (options) => prismaClient_1.default.adminUser.findMany({
    skip: options === null || options === void 0 ? void 0 : options.skip,
    take: options === null || options === void 0 ? void 0 : options.take,
    where: options === null || options === void 0 ? void 0 : options.where,
    include: Object.assign({ role: true }, options === null || options === void 0 ? void 0 : options.include),
});
exports.findAllUsers = findAllUsers;
const updateUser = (id, data) => prismaClient_1.default.adminUser.update({
    where: { id },
    data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.username && { username: data.username })), (data.email && { email: data.email })), (data.roleId && { role_id: data.roleId })), (data.phone && { phone: data.phone })), (data.address && { address: data.address })), (data.gender && { gender: data.gender })), (data.is_active !== undefined && { is_active: data.is_active })),
    include: { role: true },
});
exports.updateUser = updateUser;
const deleteUser = (id) => prismaClient_1.default.adminUser.delete({
    where: { id },
    include: { role: true },
});
exports.deleteUser = deleteUser;
const countUsers = (where) => prismaClient_1.default.adminUser.count({ where });
exports.countUsers = countUsers;
