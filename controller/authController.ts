import express from "express";
import type { Request, Response } from "express";
import * as authValidator from "../validator/authValidator";
import { AuthService } from "../services/authService";

const router = express.Router();
const authService = new AuthService();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json({ code: "500", message: err.message });
};

router.post("/login", authValidator.authValidator, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/verify-token", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.json({ code: "400", message: "Token is required" });
      return;
    }
    const result = await authService.verifyToken(token);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.json({ code: "400", message: "Token is required" });
      return;
    }
    const result = await authService.refreshToken(token);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;