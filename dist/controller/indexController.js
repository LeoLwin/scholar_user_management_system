"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("./userController"));
const roleController_1 = __importDefault(require("./roleController"));
const featuresController_1 = __importDefault(require("./featuresController"));
const permissionController_1 = __importDefault(require("./permissionController"));
const authController_1 = __importDefault(require("./authController"));
const authMiddleWare_1 = require("../MiddleWare/authMiddleWare");
const router = express_1.default.Router();
router.use("/auth", authController_1.default);
router.use("/users", authMiddleWare_1.authTokenValidator, userController_1.default);
router.use("/roles", authMiddleWare_1.authTokenValidator, roleController_1.default);
router.use("/features", authMiddleWare_1.authTokenValidator, featuresController_1.default);
router.use("/permissions", authMiddleWare_1.authTokenValidator, permissionController_1.default);
exports.default = router;
