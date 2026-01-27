"use server"
import prisma from "@/lib/prisma";
import { LoginSchema, RegisterSchema, VerifySchema } from "@/schema/user";
import z from "zod";
import { GenerateVerificationToken } from "./token";
import { SendEmail } from "./resend";
import { WelcomeEmail } from "@/emails/Welcome-Email";
import { GetVerifyURL } from "@/helpers/token";
import bcrypt from "bcryptjs"
import { signIn } from "@/auth";
import { ROUTES } from "@/lib/routes";

export const RegisterUserAction = async ({
    values
} : {
    values: z.infer<typeof RegisterSchema>
}) => {
    try {
        const parsed = RegisterSchema.safeParse(values)
        console.log(parsed)
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
        //console.log(user)

        if (!user.emailVerified) {
            const token = await GenerateVerificationToken(email)
            const verifyUrl = GetVerifyURL(token.token, token.identifier)
            await SendEmail({
                to: email,
                subject: "Witamy - Męska Strona Mocy",
                react: WelcomeEmail({
                    name: name,
                    verifyURL: verifyUrl
                })
            })
        }

    } catch (error) {
        console.error(error)
        return { error: "Wystąpił nieoczekiwany błąd"}
    }
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
        return { error: "Wystąpił nieoczekiwany błąd" }
    }
}

export const LoginUserAction = async ({
    values
} : {
    values: z.infer<typeof LoginSchema>
}) => {
    try {
        const parsed = LoginSchema.safeParse(values)
        if (!parsed.success) return { error: "Podano nieprawidłowe dane" }

        const { email, password } = parsed.data

        await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${ROUTES.kokpit}`, // <-- przekierowanie
        })
        
    } catch(error) {
        console.error(error)
        return { error: "Wystąpił nieoczekiwany bła∂"}
    }
}