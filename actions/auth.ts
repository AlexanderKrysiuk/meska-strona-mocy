"use server"

import { sendResetPasswordEmail, sendVerificationEmail } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma";
import { NewPasswordSchema, RegisterSchema, ResetPasswordSchema } from "@/schema/user";
import { VerificationToken } from "@prisma/client";
import { TypeOf, z } from "zod";
import bcrypt from "bcryptjs"
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const NEWRegisterNewUser = async (data: z.infer<typeof RegisterSchema>) => {
    
}

export async function RegisterNewUser(data: z.infer<typeof RegisterSchema>) {
    let existingUser;

    try {
        existingUser = await prisma.user.findUnique({ 
            where: { email: data.email }
        });
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych.");
    }

    if (existingUser) throw new Error("Wprowadzono nieprawidłowe dane.");

    try {
        await prisma.user.create({ data })
    } catch (error) {
        throw new Error("Rejestracja nie powiodła się. Spróbuj ponownie.")
    }

    try {
        const verificationToken = await GenerateVerificationToken(data.email)
        await sendVerificationEmail(verificationToken)
    } catch (error) {
        throw new Error("Nie udało się wysłać e-maila weryfikacyjnego.")
    }
}

export const SetNewPassword = async (data: z.infer<typeof NewPasswordSchema>, token: VerificationToken) => {
    try {
        await prisma.verificationToken.delete({
            where: { id: token.id }
        }) 
    } catch (error) {
        throw new Error("Podano nieprawidłowy token")
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS!))

    try {
        await prisma.user.update({
            where: { email: token.email },
            data: {
                password: hashedPassword,
                emailVerified: new Date()
            }
        })
    } catch (error) {
        throw new Error("Aktualizacja hasła nieudana")
    }
}

export const ResetPassword = async (data: z.infer<typeof ResetPasswordSchema>) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email}})
        if (!existingUser) return 

        await prisma.verificationToken.deleteMany({ where: { email: data.email }})

        const verificationToken = await GenerateVerificationToken(data.email)
        await sendResetPasswordEmail(verificationToken) 
    } catch(error) {
        throw new Error("Błąd połączenia z bazą danych.");
    }
}

export async function GenerateVerificationToken(email:string) {
    const expires = new Date(new Date().getTime() + 3600*100)
    return await prisma.verificationToken.create({
        data: { email, expires }
    })
}

export const GetUserByID = async () => {
    const session = await auth()

    if (!session?.user.id) throw new Error("Nie jesteś zalogowany")

    try {
        const user = await prisma.user.findUnique({
            where: {id: session.user.id}
        })

        if (!user) throw new Error("Użytkownik nie istnieje.")
        return user
    } catch(error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}

export const GetUserByEmail = async (email:string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })
        if (!user) throw new Error("Użytkownik nie istnieje.")
        return user
    } catch(error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}

export const CheckLoginOrRedirect = async () => {
    const session = await auth()

    if (!session?.user.id) return redirect("/auth/start")

    return session.user
}

export const CheckLoginReturnUser = async () => {
    const session = await auth()
    return session?.user
}