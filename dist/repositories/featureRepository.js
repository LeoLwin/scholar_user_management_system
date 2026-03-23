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
exports.FeatureRepository = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
class FeatureRepository {
    constructor() {
        this.prisma = prismaClient_1.default;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.create({
                data: {
                    name: data.name,
                },
                include: {
                    permissions: true,
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.findUnique({
                where: { id },
                include: {
                    permissions: true,
                },
            });
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.findFirst({
                where: { name },
                include: {
                    permissions: true,
                },
            });
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.findMany({
                skip: options === null || options === void 0 ? void 0 : options.skip,
                take: options === null || options === void 0 ? void 0 : options.take,
                where: options === null || options === void 0 ? void 0 : options.where,
                include: Object.assign({ permissions: true }, options === null || options === void 0 ? void 0 : options.include),
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.update({
                where: { id },
                data: Object.assign({}, (data.name && { name: data.name })),
                include: {
                    permissions: true,
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.delete({
                where: { id },
                include: {
                    permissions: true,
                },
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.feature.count({ where });
        });
    }
}
exports.FeatureRepository = FeatureRepository;
