import express, { Request, Response } from "express";
import * as RoleModel from "../model/roleModel";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", async (req: Request, res: Response) => {
  try {
    console.log("Hit the role controller")
    const { current = 1, limit = 10 } = req.query;
    const result = await RoleModel.getRoles(Number(current), Number(limit));

    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await RoleModel.getRoleById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await RoleModel.createRole(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await RoleModel.updateRole(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

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