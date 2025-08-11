"use server"

import { prisma } from "@/lib/prisma"

export const GenerateVerificationToken = async (email:string) => {
    const expires = new Date(new Date().getTime() + 3600*100)
    try {
        await prisma.verificationToken.deleteMany({
            where: {email:email}
        })
        return await prisma.verificationToken.create({
            data: {email, expires}
        })
    } catch {
        return null
    }
}