"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidator = exports.handleValidation = void 0;
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
exports.authValidator = [
    (0, express_validator_1.body)("email")
        .notEmpty().withMessage("email is required")
        .isEmail().withMessage("email must be a valid email address")
        .isString().withMessage("email must be a positive integer"),
    (0, express_validator_1.body)("password")
        .notEmpty().withMessage("password is required")
        .isString().withMessage("password must be a string"),
    exports.handleValidation
];
