import express, { Request, Response } from "express";
import * as PermissionModel from "../model/permissionModel";
import * as RolePermissionModel from "../model/rolePermissionModel";
import ResponseStatus from "../helper/responseStatus";
import MySQL from "../helper/dbHelper";


const router = express.Router();
const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

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

router.post("/", async (req, res) => {
  try {
    const result = await PermissionModel.createPermission(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await PermissionModel.deletePermission(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/roles-permissions", async (req, res) => {
  let connection;
  try {
    const { roleId, permissionIds } = req.body; // permissionIds = number[]

    if (!roleId || !Array.isArray(permissionIds) || !permissionIds.length) {
      return res.status(400).json({ message: "roleId and permissionIds required" });
    }

    connection = await MySQL.getConnection();
    await connection.beginTransaction();

    for (const permissionId of permissionIds) {
      const result = await RolePermissionModel.assignPermissionToRole(connection, {
        roleId,
        permissionId,
      });
      if (result.code !== "200") {
        await connection.rollback();
        return res.status(500).json(result);
      }
    }

    await connection.commit();
    res.json({ code: "200", message: "Permissions assigned successfully" });

  } catch (err: unknown) {
    if (connection) await connection.rollback();
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ code: "500", message: msg });
  } finally {
    if (connection) await connection.release();
  }
});

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