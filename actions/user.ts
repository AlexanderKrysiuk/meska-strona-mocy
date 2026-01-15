"use server"
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schema/user";
import z from "zod";
import { GenerateVerificationToken } from "./token";
import { SendEmail } from "./resend";
import { WelcomeEmail } from "@/emails/Welcome-Email";

export async function RegisterUser(values: z.infer<typeof RegisterSchema>) {
    const parsed = RegisterSchema.safeParse(values)

    if (!parsed.success) return { error: parsed.error.format }

    const { name, email, phone } = parsed.data

    let user = await prisma.user.findUnique({
        where: { email },
        select: { emailVerified: true }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                name,
                email,
                phone
            },
            select: {
                emailVerified: true
            }
        })
    }

    if (!user.emailVerified) {
        const token = await GenerateVerificationToken(email)
        await SendEmail(email, "Witamy na Męskiej Stronie Mocy", WelcomeEmail({name, token: token.token}))
    }
}

export async function CheckIfUserExists (email: string) {
    return !!await prisma.user.findUnique({ 
        where: { email },
        select: { id: true }
    })
}