import express from "express";
import UserController from "./userController";
import RoleController from "./roleController";
import FeaturesController from "./featuresController";
import PermissionController from "./permissionController";
import AuthController from "./authController";
import { authTokenValidator } from "../MiddleWare/authMiddleWare";



const router = express.Router();

router.use("/auth", AuthController);
router.use("/users", authTokenValidator,UserController);
router.use("/roles", authTokenValidator,RoleController);
router.use("/features", authTokenValidator,FeaturesController);
router.use("/permissions", authTokenValidator,PermissionController);


export default router;