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
exports.PermissionRepository = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
class PermissionRepository {
    constructor() {
        this.prisma = prismaClient_1.default;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.create({
                data: {
                    name: data.name,
                    feature_id: data.featureId,
                },
                include: {
                    feature: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.findUnique({
                where: { id },
                include: {
                    feature: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.findFirst({
                where: { name },
                include: {
                    feature: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.findMany({
                skip: options === null || options === void 0 ? void 0 : options.skip,
                take: options === null || options === void 0 ? void 0 : options.take,
                where: options === null || options === void 0 ? void 0 : options.where,
                include: Object.assign({ feature: true, roles: {
                        include: {
                            role: true,
                        },
                    } }, options === null || options === void 0 ? void 0 : options.include),
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.update({
                where: { id },
                data: Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.featureId && { feature_id: data.featureId })),
                include: {
                    feature: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.delete({
                where: { id },
                include: {
                    feature: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.permission.count({ where });
        });
    }
}
exports.PermissionRepository = PermissionRepository;
