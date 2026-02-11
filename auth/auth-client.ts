//lib/auth-client.ts
import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/auth/auth";

const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    plugins: [
        inferAdditionalFields<typeof auth>(),
        adminClient()
    ],
})

export const { signIn, signOut, signUp, useSession, requestPasswordReset, resetPassword, updateUser } = authClient