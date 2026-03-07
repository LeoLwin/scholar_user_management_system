import express from "express";
import ResponseStatus from "../helper/responseStatus";
import type { Request, Response } from "express";
import * as authValidator  from "../validator/authValidator";
import { login } from "../model/authModel";
// import { GetUserInfoByEmailResponse } from "../type/type";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.post("/login", authValidator.authValidator, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result: any = await login({ email, password });
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;