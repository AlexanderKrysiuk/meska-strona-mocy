// auth.config.ts
//import { PrismaAdapter } from "next-auth/prisma-adapter"; // <-- zamiast "@auth/prisma-adapter"

import prisma from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
    pages: { signIn: "/start" },

    adapter: PrismaAdapter(prisma as any),
    session: { strategy: "jwt" },

    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: {},
                password: {},
            },
            
            authorize: async (credentials) => {
                const { email, password } = credentials as {
                    email: string;
                    password: string;
                };

                const user = await prisma.user.findUnique({
                    where: { email },
                    //include: { roles: true }, // UserRole[]
                });

                if (!user) return null;
                if (!user.password) return null;
                if (!user.emailVerified) return null;

                const correctPassword = await bcrypt.compare(password, user.password);
                if (!correctPassword) return null;

                // Zwracamy obiekt z roles jako Role[]
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    phone: user.phone,
                    //roles: user.roles.map((r: { role: Role }) => r.role)
                };
            },
        }),
    ],

    callbacks: {


        async jwt({ token, trigger, user, session }) {
      // if (trigger === "update") {
      //   if (session.name) token.name = session.name
      //   if (session.image) token.image = session.image
      //   // Note, that `session` can be any arbitrary object, remember to validate it!
      //   //token.name = session.name
      // }
            if (trigger === "update" && session) {
        // aktualizujemy tylko pola, które przyszły
                return {
                    ...token,
                    ...session, // UWAGA: Über ważne – dlatego trzeba walidować session po stronie serwera
                };
            }
      
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
                token.phone = user.phone;
                token.roles = user.roles; // Role[]
            }
            return token;
        },

        async session({ session, token }) {
            if (!session.user) return session;

            session.user.id = token.id as string;
            session.user.name = token.name as string;
            session.user.email = token.email as string;
            session.user.image = token.image as string | null;
            session.user.phone = token.phone as string | null;
            //session.user.roles = token.roles as Role[];

            return session;
        },
    },
};
