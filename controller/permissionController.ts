import express, { Request, Response } from "express";
import { getPermissions, getPermissionById, createPermission, updatePermission, deletePermission } from "../services/permissionService";
import { assignPermission, getRolePermissionList } from "../services/roleService";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", async (req: Request, res: Response) => {
  try {
    const { current = 1, limit = 10 } = req.query;
    const result = await getPermissions(Number(current), Number(limit));
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Permission ID is required"));
    }
    const result = await getPermissionById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await createPermission(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Permission ID is required"));
    }
    const result = await updatePermission(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Permission ID is required"));
    }
    const result = await deletePermission(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// Bulk assign permissions to role
router.post("/roles-permissions", async (req: Request, res: Response) => {
  try {
    const { roleId, permissionIds } = req.body; // permissionIds = number[]

    if (!roleId || !Array.isArray(permissionIds) || !permissionIds.length) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("roleId and permissionIds are required"));
    }

    // Assign permissions one by one
    const results = [];
    for (const permissionId of permissionIds) {
      const result = await assignPermission(roleId, permissionId);
      results.push(result);
      // If any assignment fails, we could handle it here
    }

    res.json(ResponseStatus.OK({
      roleId,
      assignedPermissions: permissionIds.length,
      results
    }, "Permissions assigned successfully"));

  } catch (err) {
    handleError(res, err as Error);
  }
});

// Get permissions by role
router.get("/roles-permissions/:roleId", async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.roleId);
    if (!roleId) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Role ID is required"));
    }
    const result = await getRolePermissionList(roleId);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;