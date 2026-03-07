import express, { Request, Response } from "express";
import * as RoleModel from "../model/roleModel";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

// GET /roles/list
router.get("/list", async (req: Request, res: Response) => {
  try {
    const { current = 1, limit = 10 } = req.body;
    const result = await RoleModel.getRoles();
    let list = result.data || [];
    const start = (current - 1) * limit;
    const paginatedList = list.slice(start, start + limit);
    res.json(ResponseStatus.OK({ total: list.length, list: paginatedList }));
  } catch (err) {
    handleError(res, err as Error);
  }
});

// GET /roles/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await RoleModel.getRoleById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// POST /roles
router.post("/", async (req, res) => {
  try {
    const result = await RoleModel.createRole(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// PUT /roles/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await RoleModel.updateRole(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// DELETE /roles/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await RoleModel.deleteRole(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;