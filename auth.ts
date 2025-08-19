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
          const user = await prisma.user.findUnique({ 
            where: { email },
            include: { roles: true }
          });
          if (!user || !user.password || !user.emailVerified || !await bcrypt.compare(password, user.password)) return null
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            image: user.image,
            roles: user.roles.map(r => r.role)
          }  // Dodajemy rolę
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
        token.roles = user.roles as Role[]
      }
      if (user?.name) { token.name = user.name }
      //console.log("TOKEN:",token)
      return token
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token?.roles) {
        // Przypisujemy rolę z tokenu do sesji
        session.user.roles = token.roles as Role[]; // Przypisanie roli do sesji

      }
      if (token?.name) { session.user.name = token.name }
      //console.log("SESSION TOKEN:",token)
      //console.log("SESSION:",session)
      return session
    }
  },
})