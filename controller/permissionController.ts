import express, { Request, Response } from "express";
import * as PermissionModel from "../model/permissionModel";
import * as RolePermissionModel from "../model/rolePermissionModel";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();
const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

// GET /permissions/list
router.get("/list", async (req, res) => {
  try {
    const { current = 1, limit = 10 } = req.body;
    const result = await PermissionModel.getPermissions();
    let list = result.data || [];
    const start = (current - 1) * limit;
    const paginatedList = list.slice(start, start + limit);
    res.json(ResponseStatus.OK({ total: list.length, list: paginatedList }));
  } catch (err) {
    handleError(res, err as Error);
  }
});

// POST /permissions
router.post("/", async (req, res) => {
  try {
    const result = await PermissionModel.createPermission(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// DELETE /permissions/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await PermissionModel.deletePermission(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// POST /roles-permissions
router.post("/roles-permissions", async (req, res) => {
  try {
    const result = await RolePermissionModel.assignPermissionToRole(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// GET /roles-permissions/:roleId
router.get("/roles-permissions/:roleId", async (req, res) => {
  try {
    const roleId = Number(req.params.roleId);
    const result = await RolePermissionModel.getPermissionsByRole(roleId);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;