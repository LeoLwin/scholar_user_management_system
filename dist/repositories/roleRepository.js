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
exports.RoleRepository = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
class RoleRepository {
    constructor() {
        this.prisma = prismaClient_1.default;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.create({
                data: {
                    name: data.name,
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.findUnique({
                where: { id },
                include: {
                    adminUsers: true,
                    permissions: {
                        include: {
                            permission: {
                                include: {
                                    feature: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.findFirst({
                where: { name },
                include: {
                    adminUsers: true,
                    permissions: {
                        include: {
                            permission: {
                                include: {
                                    feature: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.findMany({
                skip: options === null || options === void 0 ? void 0 : options.skip,
                take: options === null || options === void 0 ? void 0 : options.take,
                where: options === null || options === void 0 ? void 0 : options.where,
                include: Object.assign({ adminUsers: true, permissions: {
                        include: {
                            permission: {
                                include: {
                                    feature: true,
                                },
                            },
                        },
                    } }, options === null || options === void 0 ? void 0 : options.include),
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.update({
                where: { id },
                data: Object.assign({}, (data.name && { name: data.name })),
                include: {
                    adminUsers: true,
                    permissions: {
                        include: {
                            permission: {
                                include: {
                                    feature: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.delete({
                where: { id },
                include: {
                    adminUsers: true,
                    permissions: {
                        include: {
                            permission: {
                                include: {
                                    feature: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.role.count({ where });
        });
    }
    assignPermission(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.rolePermission.create({
                data: {
                    role_id: roleId,
                    permissions_id: permissionId,
                },
            });
        });
    }
    removePermission(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.rolePermission.delete({
                where: {
                    role_id_permissions_id: {
                        role_id: roleId,
                        permissions_id: permissionId,
                    },
                },
            });
        });
    }
    getPermissions(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.rolePermission.findMany({
                where: { role_id: roleId },
                include: {
                    permission: {
                        include: {
                            feature: true,
                        },
                    },
                },
            });
        });
    }
}
exports.RoleRepository = RoleRepository;
