// // auth.ts
// import NextAuth from "next-auth";
// import { authConfig } from "./auth.config";

// const nextAuth = NextAuth(authConfig);

// export const handlers = nextAuth.handlers; // ✅ faktyczny eksport
// export const auth = nextAuth.auth;
// export const signIn = nextAuth.signIn;
// export const signOut = nextAuth.signOut;

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./lib/prisma";
import { SendEmail } from "./actions/resend";
import { WelcomeEmail } from "./emails/Welcome-Email";
import { resend } from "./lib/resend";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            resend.emails.send({
                from: process.env.EMAIL!,
                to: user.email,
                subject: "Weryfikacja konta",
                react: WelcomeEmail({
                    name: user.name,
                    verifyURL: url
                })
            })
        },
        sendOnSignIn: true,
        autoSignInAfterVerification: true
    },
    user: {
        additionalFields: {
            phone: {
                type: "string",
            }
        }
    }
});

type Session = typeof auth.$Infer.Session
