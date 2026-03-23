import express, { Request, Response } from "express";
import { RoleService } from "../services/roleService";
import ResponseStatus from "../helper/responseStatus";
import { CreateRoleValidator } from "../validator/roleValidator";
import { ListValidator } from "../validator/commonValidator";

const router = express.Router();
const roleService = new RoleService();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", ListValidator, async (req: Request, res: Response) => {
  try {
    console.log("Hit the role controller")
    const { current = 1, limit = 10 } = req.query;
    const result = await roleService.getRoles(Number(current), Number(limit));

    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Id is required."))
    }
    const result = await roleService.getRoleById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/", CreateRoleValidator, async (req: Request, res: Response) => {
  try {
    const result = await roleService.createRole(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/:id/permissions", async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id);
    const { permissionId } = req.body;

    if (!roleId || !permissionId) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Role ID and Permission ID are required"));
    }

    const result = await roleService.assignPermissionToRole(roleId, permissionId);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.delete("/:id/permissions/:permissionId", async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id);
    const permissionId = Number(req.params.permissionId);

    if (!roleId || !permissionId) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Role ID and Permission ID are required"));
    }

    const result = await roleService.removePermissionFromRole(roleId, permissionId);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/:id/permissions", async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id);
    if (!roleId) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Role ID is required"));
    }

    const result = await roleService.getRolePermissions(roleId);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Id is required."))
    }
    const result = await roleService.updateRole(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Id is required."))
    }
    const result = await roleService.deleteRole(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;