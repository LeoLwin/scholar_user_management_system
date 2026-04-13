import { Provider, Configuration } from 'oidc-provider';
import { getUserById } from './services/userService';

const configuration: Configuration = {
    // ၁. ဘယ် Frontend တွေကို ခွင့်ပြုမလဲ (Clients)

    scopes: ['openid', 'profile', 'email'],
    clients: [
        {
            client_id: 'mfe-client-id',
            client_secret: 'some-very-secret-string', // MFE အတွက်ဆို PKCE သုံးရင် ဒါမလိုသလောက်ပဲ
            grant_types: ['authorization_code'],
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
            secure: false,   // Localhost မှာ HTTPS မဟုတ်လို့ false ပေးရမယ်
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

    findAccount: async (ctx, id) => {
        // ဒီနေရာမှာ မင်းရဲ့ Database logic နဲ့ User ကို ရှာရမယ်
        // id ဆိုတာ interactionFinished မှာ ပေးခဲ့တဲ့ accountId ဖြစ်ပါတယ်
        const userResponse = await getUserById(Number(id));
        console.log("user : ", userResponse)
        if (!userResponse || !userResponse.data) return undefined;

        return {
            accountId: id,
            async claims(use, scope) {
                return {
                    sub: id,
                    // user.data.users.email မဟုတ်ဘဲ userResponse.data.email ဖြစ်ရမယ်
                    email: userResponse.data.email,
                    preferred_username: userResponse.data.name,
                    name: userResponse.data.name,
                    email_verified: true, // ဒါလေးပါမှ OIDC က ပိုကြိုက်တာ
                };
            },
        };
    },
};

// const oidc = new Provider('http://localhost:5000', configuration); // Backend URL
export const oidc = new Provider('http://localhost:5000/oidc', configuration);
