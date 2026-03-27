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
exports.deleteFeature = exports.updateFeature = exports.getFeatures = exports.getFeatureById = exports.createFeature = void 0;
const featureRepository_1 = require("../repositories/featureRepository");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const createFeature = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!data.name) {
            return responseStatus_1.default.INVALID_ARGUMENT('Feature name is required');
        }
        const existingFeature = yield (0, featureRepository_1.findFeatureByName)(data.name);
        if (existingFeature) {
            return responseStatus_1.default.ALREADY_EXISTS('Feature already exists');
        }
        const feature = yield (0, featureRepository_1.createFeature)(data);
        return responseStatus_1.default.OK({
            id: feature.id,
            name: feature.name,
            permissionCount: feature.permissions.length,
        }, 'Feature created successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.createFeature = createFeature;
const getFeatureById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feature = yield (0, featureRepository_1.findFeatureById)(id);
        if (!feature) {
            return responseStatus_1.default.NOT_FOUND('Feature not found');
        }
        return responseStatus_1.default.OK({
            id: feature.id,
            name: feature.name,
            permissions: feature.permissions.map((permission) => ({
                id: permission.id,
                name: permission.name,
            })),
            permissionCount: feature.permissions.length,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getFeatureById = getFeatureById;
const getFeatures = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const features = yield (0, featureRepository_1.findAllFeatures)();
        const featureData = features.map((feature) => ({
            id: feature.id,
            name: feature.name,
            permissions: feature.permissions.map((permission) => ({
                id: permission.id,
                name: permission.name,
            })),
            permissionCount: feature.permissions.length,
        }));
        return responseStatus_1.default.OK(featureData);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.getFeatures = getFeatures;
const updateFeature = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingFeature = yield (0, featureRepository_1.findFeatureById)(id);
        if (!existingFeature) {
            return responseStatus_1.default.NOT_FOUND('Feature not found');
        }
        if (data.name && data.name !== existingFeature.name) {
            const nameExists = yield (0, featureRepository_1.findFeatureByName)(data.name);
            if (nameExists) {
                return responseStatus_1.default.ALREADY_EXISTS('Feature name already exists');
            }
        }
        const updatedFeature = yield (0, featureRepository_1.updateFeature)(id, data);
        return responseStatus_1.default.OK({
            id: updatedFeature.id,
            name: updatedFeature.name,
            permissionCount: updatedFeature.permissions.length,
        }, 'Feature updated successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.updateFeature = updateFeature;
const deleteFeature = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feature = yield (0, featureRepository_1.findFeatureById)(id);
        if (!feature) {
            return responseStatus_1.default.NOT_FOUND('Feature not found');
        }
        if (feature.permissions.length > 0) {
            return responseStatus_1.default.FAILED_PRECONDITION('Cannot delete feature with assigned permissions');
        }
        yield (0, featureRepository_1.deleteFeature)(id);
        return responseStatus_1.default.OK(null, 'Feature deleted successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return responseStatus_1.default.UNKNOWN(message);
    }
});
exports.deleteFeature = deleteFeature;
