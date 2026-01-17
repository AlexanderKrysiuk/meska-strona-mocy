import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { SendEmail } from "./resend"
import { email } from "zod"
import { WelcomeEmail } from "@/emails/Welcome-Email"
import { TokenResetEmail } from "@/emails/Token-Reset"
import { GetVerifyURL } from "@/helpers/token"

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

export async function VerifyToken(
    token:string,
    identifier: string
) {
    const record = await prisma.verificationToken.findUnique({
        where: { identifier_token: {
            token,
            identifier
        }},
        select: {
            expires: true,
            identifier: true
        }
    })
    
    if (!record) return {
        success: false,
        data: "Nie znaleziono tokenu"
    }

    if (record.expires < new Date()) {
        const newToken = await GenerateVerificationToken(record.identifier)
        const resetURL = GetVerifyURL({
            token: newToken.token,
            identifier: newToken.identifier
        })
        await SendEmail({
            to: record.identifier,
            subject: "Twój token został zresetowany",
            react: TokenResetEmail({
                resetURL: resetURL
            })
        })
    }
}