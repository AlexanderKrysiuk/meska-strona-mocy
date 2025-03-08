import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {},
      authorize: async (credentials) => {
          const { email, password } = credentials as { email:string, password: string} 
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password || !user.emailVerified || !await bcrypt.compare(password, user.password)) return null
          return { id: user.id, email: user.email , name: user.name, image: user.image, role: user.role ?? undefined}  // Dodajemy rolę
      }
    })
  ],
  pages:{
    signIn: "/auths/start"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Przypisujemy rolę z użytkownika do tokenu
        token.role = user.role
      }
      //console.log("TOKEN:",token)
      return token
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token?.role) {
        // Przypisujemy rolę z tokenu do sesji
        session.user.role = token.role as Role; // Przypisanie roli do sesji

      }
      //console.log("SESSION TOKEN:",token)
      //console.log("SESSION:",session)
      return session
    }
  },
})