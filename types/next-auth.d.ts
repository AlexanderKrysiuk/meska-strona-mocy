// types/next-auth.d.ts
import { Role } from '@prisma/client'
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

// Rozszerzamy typy NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role?: Role // Dodajemy rolę, która będzie typem 'Role' z Prisma
    } & DefaultSession['user']
  }

  interface User {
    role?: Role // Dodajemy opcjonalne pole 'role', które będzie typu 'Role' z Prisma
  }

  interface JWT {
    role?: Role // Dodajemy rolę do JWT
  }
}