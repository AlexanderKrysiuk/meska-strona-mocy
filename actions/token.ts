import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function GenerateVerificationToken(email: string) {
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60)

    await prisma.verificationToken.deleteMany({
        where: { identifier: email }
    })

    return await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    })
}