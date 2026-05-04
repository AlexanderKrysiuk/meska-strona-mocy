//lib/prisma.ts
// import "dotenv/config";
// import { PrismaClient } from '../generated/prisma/client'
// import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'


// export const prisma = new PrismaClient({
//   adapter: new PrismaPostgresAdapter({
//     connectionString: process.env.DATABASE_URL!,
//   }),
// })

//import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@prisma/client"


const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

// import "dotenv/config";

// import { PrismaClient } from "../generated/prisma/client"
// import { withAccelerate } from "@prisma/extension-accelerate"
 
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
// const connectionString = process.env.DATABASE_URL

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient({
//     adapter: { connection: connectionString }
//   }).$extends(withAccelerate())
 
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma