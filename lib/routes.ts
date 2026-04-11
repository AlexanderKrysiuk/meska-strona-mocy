//lib/routes.ts
import { ac } from "@/auth/permissions"
import { Session, User } from "better-auth"
import { CirclePile, User as UserIcon, Wallet } from "lucide-react"
import { authClient } from "@/auth/auth-client"

export const routes = {
    start: "/auth/start",
    resetPassword: "/auth/reset",
    newPassword: "/auth/new-password",
    kokpit: "/kokpit",
    verify: "/verify",
    signOutRedirect: "/",
    signInRedirect: "/"
}