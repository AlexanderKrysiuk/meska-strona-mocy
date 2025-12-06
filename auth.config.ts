// auth.config.ts
//import { PrismaAdapter } from "next-auth/prisma-adapter"; // <-- zamiast "@auth/prisma-adapter"

import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/start",
  },

  adapter: PrismaAdapter(prisma) as any,
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
          include: { roles: true }, // UserRole[]
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
          roles: user.roles.map(r => r.role), // Role[]
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
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
      session.user.roles = token.roles as Role[];

      return session;
    },
  },

  // TS nie będzie narzekał, bo używamy type assertion w JWT i session
};


// import { PrismaAdapter } from "@auth/prisma-adapter"
// import Credentials from "next-auth/providers/credentials";
// import { prisma } from "@/lib/prisma";
// import type { NextAuthConfig } from "next-auth";
// import { Role } from "@prisma/client";
// import bcrypt from "bcryptjs";

// export default {
//     pages: {
//         signIn: "/auth/start",
//     },

//     adapter: PrismaAdapter(prisma),
//     session: { strategy: "jwt" },

//     providers: [
//         Credentials({
//             name: "credentials",
//             credentials: {
//                 email: {},
//                 password: {}
//             },
//             authorize: async (credentials) => {
//                 const { email, password } = credentials as {
//                     email: string;
//                     password: string;
//                 };

//             const user = await prisma.user.findUnique({
//                 where: { email },
//                 include: { roles: true },
//             });

//             if (!user) return null;
//             if (!user.password) return null;
//             if (!user.emailVerified) return null;

//             const correctPassword = await bcrypt.compare(password, user.password);
//             if (!correctPassword) return null;

//             return {
//                 id: user.id,
//                 email: user.email,
//                 name: user.name,
//                 image: user.image,
//                 roles: user.roles.map(r => r.role),
//             };
//         }
//         })
//     ],

//     callbacks: {
//         async jwt({ token, user }) {
//             if (user) {
//                 token.id = user.id;
//                 token.name = user.name;
//                 token.email = user.email;
//                 token.image = user.image;
//                 token.roles = user.roles;
//             }
//             return token;
//         },
          

//         async session({ session, token }) {
//             if (!session.user) return session;

//             session.user.id = token.id as string;
//             session.user.name = token.name as string;
//             session.user.email = token.email as string;
//             session.user.image = token.image as string | null;
//             session.user.roles = token.roles as Role[];

//             return session;
//         }
//     }
// } satisfies NextAuthConfig;


// // import { NextAuthConfig } from "next-auth";
// // import { PrismaAdapter } from "@auth/prisma-adapter";
// // import { prisma } from "@/lib/prisma"
// // import { Role } from "@prisma/client";

// // export const authConfig = {
// //     pages: { signIn: "/auth/start" },
// //     adapter: PrismaAdapter(prisma),
// //     session: { strategy: "jwt" },
// //     providers: [],
// //     callbacks: {
// //         async session({ token, session}){
// //             if (token?.roles) { session.user.roles = token.roles as Role[] }
// //             if (token?.name) { session.user.name = token.name }
// //             if (token?.title) { session.user.title = token.title as string }
// //             return session
// //         }
// //       },
// // } satisfies NextAuthConfig