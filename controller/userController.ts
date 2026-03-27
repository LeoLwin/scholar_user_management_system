import express, { Request, Response } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../services/userService";
import ResponseStatus from "../helper/responseStatus";
import { CreateUserValidator } from "../validator/userValidator";
import { ListValidator } from "../validator/commonValidator";

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
router.get("/list", ListValidator, async (req: Request, res: Response) => {
  try {
    const { current = 1, limit = 10 } = req.query;
    const result = await getUsers(Number(current), Number(limit));
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// GET /users/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Id is required."))
    }
    const result = await getUserById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// POST /users
router.post("/", CreateUserValidator, async (req: Request, res: Response) => {
  try {
    const result = await createUser(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// PUT /users/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Id is required."))
    }
    const result = await updateUser(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// DELETE /users/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Id is required."))
    }
    const result = await deleteUser(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;