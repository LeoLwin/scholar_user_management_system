"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserValidator = exports.CreateUserValidator = exports.handleValidation = void 0;
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
exports.CreateUserValidator = [
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("name is required")
        .isString().withMessage("name must be a string"),
    (0, express_validator_1.body)("username")
        .notEmpty().withMessage("username is required")
        .isString().withMessage("username must be a string"),
    (0, express_validator_1.body)("email")
        .notEmpty().withMessage("email is required")
        .isEmail().withMessage("email must be a valid email address")
        .isString().withMessage("email must be a string"),
    (0, express_validator_1.body)("password")
        .notEmpty().withMessage("password is required")
        .isString().withMessage("password must be a string")
        .isLength({ min: 8 }).withMessage("password must be at least 8 characters"),
    (0, express_validator_1.body)("roleId")
        .notEmpty().withMessage("roleId is required")
        .isInt({ min: 1 }).withMessage("roleId must be a positive integer"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isString().withMessage("phone must be a string")
        .matches(/^\d+$/).withMessage("phone must contain only digits"),
    (0, express_validator_1.body)("address")
        .optional()
        .isString().withMessage("address must be a string"),
    (0, express_validator_1.body)("gender")
        .optional()
        .isIn(["male", "female", "other"]).withMessage("gender must be 'male', 'female', or 'other'"),
    exports.handleValidation
];
exports.ListUserValidator = [
    (0, express_validator_1.query)("current")
        .optional()
        .isInt({ min: 1 }).withMessage("current must be a positive integer")
        .toInt(), // automatically convert to number
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1 }).withMessage("limit must be a positive integer")
        .toInt(),
    exports.handleValidation
];
