import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import ResponseStatus from "../helper/responseStatus";


export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  console.log("Validation errors object:", JSON.stringify(errors.array()));
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.json(
      ResponseStatus.INVALID_ARGUMENT(
        errors.array().map(err => err.msg).join(", ")
      )
    );
  }
  next();
};



export const CreateUserValidator = [
  body("name")
    .notEmpty().withMessage("name is required")
    .isString().withMessage("name must be a string"),

  // body("username")
  //   .notEmpty().withMessage("username is required")
  //   .isString().withMessage("username must be a string"),

  body("email")
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("email must be a valid email address")
    .isString().withMessage("email must be a string"),

  // body("password")
  //   .notEmpty().withMessage("password is required")
  //   .isString().withMessage("password must be a string")
  //   .isLength({ min: 8 }).withMessage("password must be at least 8 characters"),

  body("roleId")
    .notEmpty().withMessage("roleId is required")
    .isInt({ min: 1 }).withMessage("roleId must be a positive integer"),

  body("phone")
    .optional()
    .isString().withMessage("phone must be a string")
    .matches(/^\d+$/).withMessage("phone must contain only digits"),

  body("address")
    .optional()
    .isString().withMessage("address must be a string"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"]).withMessage("gender must be 'male', 'female', or 'other'"),

  handleValidation
];

