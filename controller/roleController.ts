import express, { Request, Response } from "express";
import { getRoles, getRoleById, createRole, updateRole, deleteRole, assignPermission, removePermission, getRolePermissionList, getRolesNameAndValue } from "../services/roleService";
import ResponseStatus from "../helper/responseStatus";
import { CreateRoleValidator } from "../validator/roleValidator";
import { ListValidator } from "../validator/commonValidator";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", ListValidator, async (req: Request, res: Response) => {
  try {
    const { current = 1, limit = 10, name } = req.query;

    const result = await getRoles(Number(current), Number(limit), name as string);

    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/name-value", async (req: Request, res: Response) => {
  try {
    const result = await getRolesNameAndValue();
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
    const result = await getRoleById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/", CreateRoleValidator, async (req: Request, res: Response) => {
  try {
    const result = await createRole(req.body);
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

    const result = await assignPermission(roleId, permissionId);
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

    const result = await removePermission(roleId, permissionId);
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

    const result = await getRolePermissionList(roleId);
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
    const result = await updateRole(id, req.body);
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
    const result = await deleteRole(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});



export default router;