"use server"
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schema/user";
import z from "zod";
import { GenerateVerificationToken } from "./token";
import { SendEmail } from "./resend";
import { WelcomeEmail } from "@/emails/Welcome-Email";
import { GetVerifyURL } from "@/helpers/token";

export const RegisterUser = async ({
    values
} : {
    values: z.infer<typeof RegisterSchema>
}) => {
    const parsed = RegisterSchema.safeParse(values)

    if (!parsed.success) return { error: parsed.error.format }

    const { name, email, phone } = parsed.data

    const user = await prisma.user.upsert({
        where: { email: email },
        update: {},
        create: {
            name: name,
            email: email,
            phone: phone
        },
        select: {
            emailVerified: true
        }
    })

    if (!user.emailVerified) {
        const token = await GenerateVerificationToken(email)
        const verifyUrl = GetVerifyURL({
            token: token.token,
            identifier: token.identifier
        })
        await SendEmail({
            to: token.identifier,
            subject: "Witamy - Męska Strona Mocy",
            react: WelcomeEmail({
                name: name,
                verifyURL: verifyUrl
            })
        })
    }
}

export async function CheckIfUserExists (email: string) {
    return !!await prisma.user.findUnique({ 
        where: { email },
        select: { id: true }
    })
}