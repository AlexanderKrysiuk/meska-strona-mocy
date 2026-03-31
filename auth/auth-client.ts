//lib/auth-client.ts
import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/auth/auth";
import { ac, admin, moderator } from "./permissions";

const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        inferAdditionalFields<typeof auth>(),
        adminClient({
            ac,
            roles: {
                admin,
                moderator
            }
        })
    ],
})

export const { signIn, signOut, signUp, useSession, requestPasswordReset, resetPassword, updateUser } = authClient