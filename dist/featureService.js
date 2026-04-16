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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeature = exports.updateFeature = exports.getFeatureById = exports.createFeature = exports.getFeatures = void 0;
const api_1 = __importDefault(require("./api"));
// import { useState, useEffect } from "react";
const ApiResonse_1 = require("./ApiResonse");
const getFeatures = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { page, per_page, sort_by, sort_order, filters } = queryParams;
    const payload = {
        currentPage: Number(page) || 1,
        limit: Number(per_page) || 10,
        sort_by: sort_by || "id",
        sort_order: sort_order || "asc",
        filters: filters || {},
    };
    console.log("Fetching roles with payload:", payload);
    const res = yield api_1.default.get(`/features/list?current=${page || 1}&limit=${per_page}&name=${filters.name || ""}`);
    console.log("API Response:", res);
    try {
        const responseJson = (0, ApiResonse_1.handleApiResponse)(res);
        return Object.assign(Object.assign({}, responseJson), { data: {
                data: (_a = res.data) === null || _a === void 0 ? void 0 : _a.features,
                totalEntries: (_c = (_b = res.data) === null || _b === void 0 ? void 0 : _b.pagination) === null || _c === void 0 ? void 0 : _c.totalRecords,
                totalPages: (_e = (_d = res.data) === null || _d === void 0 ? void 0 : _d.pagination) === null || _e === void 0 ? void 0 : _e.totalPages,
                page: (_g = (_f = res.data) === null || _f === void 0 ? void 0 : _f.pagination) === null || _g === void 0 ? void 0 : _g.currentPage,
            } });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching roles:", errorMessage);
        return {
            status: "error",
            message: errorMessage,
        };
    }
});
exports.getFeatures = getFeatures;
const createFeature = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = data, payload = __rest(data, ["id"]);
    console.log('createFeature payload', id);
    const res = yield api_1.default.post("/features", payload);
    return (0, ApiResonse_1.handleApiResponse)(res);
});
exports.createFeature = createFeature;
const getFeatureById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield api_1.default.get(`/feature/details/${id}`);
    console.log('getFeatureById', res);
    const response = (0, ApiResonse_1.handleApiResponse)(res);
    return Object.assign(Object.assign({}, response), { data: res.data });
});
exports.getFeatureById = getFeatureById;
const updateFeature = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield api_1.default.put(`/features/${id}`, data);
    return (0, ApiResonse_1.handleApiResponse)(res);
});
exports.updateFeature = updateFeature;
const deleteFeature = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield api_1.default.delete(`/features/${id}`);
    return (0, ApiResonse_1.handleApiResponse)(res);
});
exports.deleteFeature = deleteFeature;
