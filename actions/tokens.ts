"use server"

import { prisma } from "@/lib/prisma"

export const GenerateVerificationToken = async (email:string) => {
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)
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

export const GetVerificationToken = async (id:string) => {
    try {
        return await prisma.verificationToken.findUnique({
            where: {id: id}
        })
    } catch {
        return null
    }
}