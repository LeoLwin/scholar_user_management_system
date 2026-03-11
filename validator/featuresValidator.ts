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

export const CreateFeaturesValidator = [
    body("name")
        .notEmpty().withMessage("name is required")
        .isString().withMessage("name must be a string"),

    handleValidation
];
