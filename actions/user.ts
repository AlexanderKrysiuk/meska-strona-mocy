"use server"
import { prisma } from "@/lib/prisma";
import { RegisterSchema, VerifySchema } from "@/schema/user";
import z, { success } from "zod";
import { GenerateVerificationToken } from "./token";
import { SendEmail } from "./resend";
import { WelcomeEmail } from "@/emails/Welcome-Email";
import { GetVerifyURL } from "@/helpers/token";
import bcrypt from "bcryptjs"
import { error } from "console";


export const RegisterUserAction = async ({
    values
} : {
    values: z.infer<typeof RegisterSchema>
}) => {
    try {
        const parsed = RegisterSchema.safeParse(values)
        if (!parsed.success) return { error: "Podano nieprawidłowe dane" }
        
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

    } catch (error) {
        return { error: "Wystąpił nieoczekiwany błąd"}
    }
}

export async function CheckIfUserExists (email: string) {
    return !!await prisma.user.findUnique({ 
        where: { email },
        select: { id: true }
    })
}

export const SetPasswordAction = async ({
    values
} : {
    values: z.infer<typeof VerifySchema>
}) => {
    try {
        const parsed = VerifySchema.safeParse(values)
        if (!parsed.success) return { error: "Podano nieprawidłowe dane" }

        const hashedPassword = await bcrypt.hash(values.newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS!))
        
        await prisma.user.update({
            where: { email: values.email },
            data: {
                password: hashedPassword,
                emailVerified: new Date()
            }
        })
    
    } catch (error) {
        console.error(error)
        return { error: "Wystąpił nieznany błąd" }
    }
}