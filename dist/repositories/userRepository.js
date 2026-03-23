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
exports.UserRepository = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
class UserRepository {
    constructor() {
        this.prisma = prismaClient_1.default;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.create({
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
                include: {
                    role: true,
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.findUnique({
                where: { id },
                include: {
                    role: true,
                },
            });
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.findUnique({
                where: { email },
                include: {
                    role: true,
                },
            });
        });
    }
    findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.findFirst({
                where: { username },
                include: {
                    role: true,
                },
            });
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.findMany({
                skip: options === null || options === void 0 ? void 0 : options.skip,
                take: options === null || options === void 0 ? void 0 : options.take,
                where: options === null || options === void 0 ? void 0 : options.where,
                include: Object.assign({ role: true }, options === null || options === void 0 ? void 0 : options.include),
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.update({
                where: { id },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.username && { username: data.username })), (data.email && { email: data.email })), (data.roleId && { role_id: data.roleId })), (data.phone && { phone: data.phone })), (data.address && { address: data.address })), (data.gender && { gender: data.gender })), (data.is_active !== undefined && { is_active: data.is_active })),
                include: {
                    role: true,
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.delete({
                where: { id },
                include: {
                    role: true,
                },
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.adminUser.count({ where });
        });
    }
}
exports.UserRepository = UserRepository;
