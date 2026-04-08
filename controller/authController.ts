import express from "express";
import type { Request, Response } from "express";
import * as authValidator from "../validator/authValidator";
import { login, verifyToken, refreshToken } from "../services/authService";
import { oidc } from "../provider";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json({ code: "500", message: err.message });
};

router.post("/login", authValidator.authValidator, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
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
    const result = await verifyToken(token);
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
    const result = await refreshToken(token);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// Express Route ဥပမာ
router.post('/sso/login/:uid', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { uid } = req.params;

    console.log("--- SSO Request Debug ---");
    console.log("UID:", uid);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Cookies Header:", req.headers.cookie);
    console.log("-------------------------");

    const authResult = await login({ email, password });

    if (authResult && authResult.data && authResult.data.user) {

      // oidc-provider ရဲ့ context ကို req/res ကနေ ဆွဲထုတ်ပါ
      // ဒါမှ interaction session ကို အတိအကျ သိမှာပါ
      const interactionDetails = await oidc.interactionDetails(req, res);

      if (!interactionDetails || interactionDetails.uid !== uid) {
        return res.status(400).json({ message: "Interaction session expired or invalid." });
      }

      const interactionResult = {
        login: {
          accountId: authResult.data.user.id.toString(),
        },
      };

      // interactionResult ကို await လုပ်ပြီး redirect URL ကို ယူမယ်
      // ဒီနေရာမှာ ctx မသုံးဘဲ req, res သုံးတာ မှန်ပါတယ်၊ 
      // ဒါပေမဲ့ provider.ts မှာ domain: 'localhost' ထည့်ထားဖို့တော့ လိုမယ်
      const redirectTo = await oidc.interactionResult(req, res, interactionResult);

      return res.json({
        success: true,
        redirectTo
      });
    } else {
      return res.status(401).json({ message: "Invalid Email or password!" });
    }
  } catch (err: any) {
    console.error("SSO Login Error:", err);
    if (err.name === 'SessionNotFound' || err.message.includes('session not found')) {
      return res.status(400).json({ 
        message: "SSO Session not found. Please clear your cookies and try again.",
        detail: "The browser might be blocking the session cookie between port 5174 and 5000."
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
export default router;