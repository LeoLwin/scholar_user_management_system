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
router.get("/list", async (req: Request, res: Response) => {
  try {
    const { current = 1, limit = 10 } = req.query;
    const result = await UserModel.getUsers(Number(current), Number(limit));
    res.json(result);
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