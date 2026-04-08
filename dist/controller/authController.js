"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authValidator = __importStar(require("../validator/authValidator"));
const authService_1 = require("../services/authService");
const provider_1 = require("../provider");
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json({ code: "500", message: err.message });
};
router.post("/login", authValidator.authValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield (0, authService_1.login)({ email, password });
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/verify-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.json({ code: "400", message: "Token is required" });
            return;
        }
        const result = yield (0, authService_1.verifyToken)(token);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/refresh-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.json({ code: "400", message: "Token is required" });
            return;
        }
        const result = yield (0, authService_1.refreshToken)(token);
        res.json(result);
    }
    catch (err) {
        handleError(res, err);
    }
}));
// Express Route ဥပမာ
router.post('/sso/login/:uid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { uid } = req.params;
        console.log("--- SSO Request Debug ---");
        console.log("UID:", uid);
        console.log("Headers:", JSON.stringify(req.headers, null, 2));
        console.log("Cookies Header:", req.headers.cookie);
        console.log("-------------------------");
        const authResult = yield (0, authService_1.login)({ email, password });
        if (authResult && authResult.data && authResult.data.user) {
            // oidc-provider ရဲ့ context ကို req/res ကနေ ဆွဲထုတ်ပါ
            // ဒါမှ interaction session ကို အတိအကျ သိမှာပါ
            const interactionDetails = yield provider_1.oidc.interactionDetails(req, res);
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
            const redirectTo = yield provider_1.oidc.interactionResult(req, res, interactionResult);
            return res.json({
                success: true,
                redirectTo
            });
        }
        else {
            return res.status(401).json({ message: "Invalid Email or password!" });
        }
    }
    catch (err) {
        console.error("SSO Login Error:", err);
        if (err.name === 'SessionNotFound' || err.message.includes('session not found')) {
            return res.status(400).json({
                message: "SSO Session not found. Please clear your cookies and try again.",
                detail: "The browser might be blocking the session cookie between port 5174 and 5000."
            });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = router;
