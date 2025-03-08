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
            if (token.role) {
                session.user.role = token.role as Role
              }
            return session
        }
      },
} satisfies NextAuthConfig