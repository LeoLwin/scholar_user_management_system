import express, { Request, Response } from "express";
import * as UserModel from "../model/userModel";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/test", async (req: Request, res: Response) => {
  try {
    res.json(ResponseStatus.OK("User endpoint is working"));
  } catch (err) {
    handleError(res, err as Error);
  }
});

// GET /users/list
router.post("/list", async (req: Request, res: Response) => {
  try {
    const { current = 1, limit = 10 } = req.body;
    const result = await UserModel.getUsers();
    let list = result.data || [];
    const start = (current - 1) * limit;
    const paginatedList = list.slice(start, start + limit);
    res.json(ResponseStatus.OK({ total: list.length, list: paginatedList }));
  } catch (err) {
    handleError(res, err as Error);
  }
});

// GET /users/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await UserModel.getUserById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// POST /users
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await UserModel.createUser(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// PUT /users/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await UserModel.updateUser(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// DELETE /users/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await UserModel.deleteUser(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;