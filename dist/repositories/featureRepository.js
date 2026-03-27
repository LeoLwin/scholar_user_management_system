"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countFeatures = exports.deleteFeature = exports.updateFeature = exports.findAllFeatures = exports.findFeatureByName = exports.findFeatureById = exports.createFeature = void 0;
const prismaClient_1 = __importDefault(require("../helper/prismaClient"));
const createFeature = (data) => prismaClient_1.default.feature.create({
    data: { name: data.name },
    include: { permissions: true },
});
exports.createFeature = createFeature;
const findFeatureById = (id) => prismaClient_1.default.feature.findUnique({
    where: { id },
    include: { permissions: true },
});
exports.findFeatureById = findFeatureById;
const findFeatureByName = (name) => prismaClient_1.default.feature.findFirst({
    where: { name },
    include: { permissions: true },
});
exports.findFeatureByName = findFeatureByName;
const findAllFeatures = (options) => prismaClient_1.default.feature.findMany({
    skip: options === null || options === void 0 ? void 0 : options.skip,
    take: options === null || options === void 0 ? void 0 : options.take,
    where: options === null || options === void 0 ? void 0 : options.where,
    include: Object.assign({ permissions: true }, options === null || options === void 0 ? void 0 : options.include),
});
exports.findAllFeatures = findAllFeatures;
const updateFeature = (id, data) => prismaClient_1.default.feature.update({
    where: { id },
    data: Object.assign({}, (data.name && { name: data.name })),
    include: { permissions: true },
});
exports.updateFeature = updateFeature;
const deleteFeature = (id) => prismaClient_1.default.feature.delete({
    where: { id },
    include: { permissions: true },
});
exports.deleteFeature = deleteFeature;
const countFeatures = (where) => prismaClient_1.default.feature.count({ where });
exports.countFeatures = countFeatures;
