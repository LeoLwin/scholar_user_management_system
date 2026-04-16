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
const express_1 = __importDefault(require("express"));
const featureService_1 = require("../services/featureService");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const featuresValidator_1 = require("../validator/featuresValidator");
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current, limit, name } = req.query;
        const result = yield (0, featureService_1.getFeatures)(Number(current), Number(limit), name);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/name-value", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, featureService_1.getFeaturesNameAndValue)();
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Feature ID is required"));
        }
        const result = yield (0, featureService_1.getFeatureById)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/", featuresValidator_1.CreateFeaturesValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, featureService_1.createFeature)(req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        console.log("id : ", id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Feature ID is required"));
        }
        const result = yield (0, featureService_1.updateFeature)(id, req.body);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.json(responseStatus_1.default.INVALID_ARGUMENT("Feature ID is required"));
        }
        const result = yield (0, featureService_1.deleteFeature)(id);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
