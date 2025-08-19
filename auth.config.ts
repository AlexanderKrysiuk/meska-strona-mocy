import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client";

export const authConfig = {
    pages: { signIn: "/auth/start" },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [],
    callbacks: {
        async session({ token, session}){
            if (token?.roles) { session.user.roles = token.roles as Role[] }
            if (token?.name) { session.user.name = token.name }
            return session
        }
      },
} satisfies NextAuthConfig