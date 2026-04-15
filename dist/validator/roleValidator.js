"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoleValidator = exports.handleValidation = void 0;
const express_validator_1 = require("express-validator");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const handleValidation = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    console.log("Validation errors object:", JSON.stringify(errors.array()));
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.json(responseStatus_1.default.INVALID_ARGUMENT(errors.array().map(err => err.msg).join(", ")));
    }
    next();
};
exports.handleValidation = handleValidation;
exports.CreateRoleValidator = [
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("name is required")
        .isString().withMessage("name must be a string"),
    // body("permissionId")
    //   .notEmpty().withMessage("permissionId is required")
    //   .isInt({ min: 1 }).withMessage("permissionId must be a positive integer"),
    exports.handleValidation
];
