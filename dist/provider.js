"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oidc = void 0;
const oidc_provider_1 = require("oidc-provider");
const userService_1 = require("./services/userService");
const configuration = {
    // ၁. ဘယ် Frontend တွေကို ခွင့်ပြုမလဲ (Clients)
    clients: [
        {
            client_id: 'mfe-client-id',
            client_secret: 'some-very-secret-string', // MFE အတွက်ဆို PKCE သုံးရင် ဒါမလိုသလောက်ပဲ
            grant_types: ['authorization_code', 'refresh_token'],
            redirect_uris: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:5176'
            ],
            response_types: ['code'],
        },
    ],
    // ၂. User login ဝင်ဖို့အတွက် ကိုယ့်ရဲ့ Login Page ဆီ ပို့ပေးမယ့် logic
    interactions: {
        url(ctx, interaction) {
            return `http://localhost:5174/login/${interaction.uid}`;
        },
    },
    cookies: {
        keys: ['some secret key'],
        short: {
            secure: false, // Localhost မှာ HTTPS မဟုတ်လို့ false ပေးရမယ်
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        },
        long: {
            secure: false,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        }
    },
    // ၃. SSO အတွက် အရေးကြီးဆုံး - Session ထားမယ့်အချိန်
    ttl: {
        AccessToken: 1 * 60 * 60, // 1 hour
        IdToken: 1 * 60 * 60,
        Session: 14 * 24 * 60 * 60, // 14 days (ဒါရှိနေရင် အခြား App တွေမှာ login ထပ်ဝင်စရာမလိုတော့ဘူး)
    },
    features: {
        // ၁။ ဒီကောင်ကို false ပေးမှ မင်းရဲ့ interactions.url အလုပ်လုပ်မှာ
        devInteractions: { enabled: false },
    },
    findAccount: (ctx, id) => __awaiter(void 0, void 0, void 0, function* () {
        // ဒီနေရာမှာ မင်းရဲ့ Database logic နဲ့ User ကို ရှာရမယ်
        // id ဆိုတာ interactionFinished မှာ ပေးခဲ့တဲ့ accountId ဖြစ်ပါတယ်
        const user = yield (0, userService_1.getUserById)(Number(id));
        console.log("user : ", user);
        if (!user)
            return undefined;
        return {
            accountId: id,
            claims(use, scope) {
                return __awaiter(this, void 0, void 0, function* () {
                    return {
                        sub: id,
                        email: user.data.users.email, // Database က email ကို ထည့်ပေးပါ
                        preferred_username: user.data.users.name
                    };
                });
            },
        };
    }),
};
// const oidc = new Provider('http://localhost:5000', configuration); // Backend URL
exports.oidc = new oidc_provider_1.Provider('http://localhost:5000', configuration);
exports.oidc.proxy = false;
