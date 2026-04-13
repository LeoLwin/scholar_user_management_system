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
router.get('/sso/login/:uid', async (req: Request, res: Response) => {
  try {
    // const { email, password } = req.body;
    // const { uid } = req.params;
    const { email, password } = req.query as { email: string; password: string };
    const { uid } = req.params;
    console.log("Data : ", { email, password, uid })
    if (!email || !password) {
      return res.json("Need emaila adn password")
    }

    console.log("--- SSO Request Debug ---");
    console.log("UID:", uid);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Cookies Header:", req.headers.cookie);
    console.log("-------------------------");

    const authResult = await login({ email, password });

    if (authResult && authResult.data && authResult.data.user) {
      const interactionResult = {
        login: {
          accountId: authResult.data.user.id.toString(),
        },
      };

      try {
        // ၁။ Result ကို အရင်သိမ်းပါ (ဒါက Response ကို မပိတ်ပါဘူး)
        await oidc.interactionResult(req, res, interactionResult);

        // ၂။ interactionDetails ထဲက returnTo URL ကို ဆွဲထုတ်ပါ
        // ဒါက OIDC ကနေ UI ဆီ ပြန်သွားမယ့် လိပ်စာအမှန် (Resume URL) ပါ
        const details = await oidc.interactionDetails(req, res);
        const redirectTo = details.returnTo;

        console.log("Success! Redirecting to Resume URL:", redirectTo);

        // ၃။ JSON နဲ့ အေးဆေးပြန်လို့ ရသွားပါပြီ
        // return res.json({
        //   success: true,
        //   redirectTo: redirectTo
        // });
        // return res.redirect(redirectTo);
        const resumeUrl = details.returnTo;

        return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: green;">Login Success (Backend Level)</h2>
            <p>User: <b>${authResult.data.user.name}</b></p>
            <p>Interaction UID: <code>${uid}</code></p>
            <hr/>
            <p>အခု အောက်က ခလုတ်ကို နှိပ်ရင် Dashboard ဆီ ပြန်သွားရမယ်။</p>
            <a href="${resumeUrl}" style="padding: 10px 20px; background: blue; color: white; text-decoration: none; border-radius: 5px;">
               Final Step: Go to Dashboard
            </a>
            <div style="margin-top: 20px; color: gray; font-size: 12px;">
               Resume URL: ${resumeUrl}
            </div>
          </body>
        </html>
      `);

      } catch (oidcError) {
        console.error("OIDC Processing Error:", oidcError);
        return res.status(500).json({ message: "OIDC Process Failed" });
      }
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