// types/next-auth.d.ts
import { Role } from '@prisma/client'
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

// Rozszerzamy typy NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      roles: Role[] // Dodajemy rolę, która będzie typem 'Role' z Prisma
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    roles?: Role[] // Dodajemy opcjonalne pole 'role', które będzie typu 'Role' z Prisma
  }

  interface JWT {
    roles: Role[] // Dodajemy rolę do JWT
  }
}