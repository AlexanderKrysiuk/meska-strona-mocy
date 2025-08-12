"use server"

import { prisma } from "@/lib/prisma";
import { NewPasswordSchema, RegisterSchema, ResetPasswordSchema } from "@/schema/user";
import { VerificationToken } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs"
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GenerateVerificationToken } from "./tokens";
import { SendResetPasswordEmail } from "./resend";
import { GetUserByEmail } from "./user";

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
        //await sendVerificationEmail(verificationToken)
    } catch (error) {
        throw new Error("Nie udało się wysłać e-maila weryfikacyjnego.")
    }
}

export const SetNewPassword = async (data: z.infer<typeof NewPasswordSchema>, token: VerificationToken) => {
    const hashedPassword = await bcrypt.hash(data.newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS!))

    try {
        await prisma.verificationToken.deleteMany({
            where: { id: token.id }
        })
        await prisma.user.update({
            where: { email: token.email },
            data: {
                password: hashedPassword,
                emailVerified: new Date()
            }
        })
        return {
            success: true,
            message: "Pomyślnie zmieniono hasło"
        }
    } catch (error) {
        return {
            success: false,
            message: "Zmiana hasła nieudana, spróbuj ponownie"
        }
    }
}

export const ResetPassword = async (data: z.infer<typeof ResetPasswordSchema>) => {
    const user = await GetUserByEmail(data.email)

    if (user) {
        const verificationToken = await GenerateVerificationToken(data.email)

        if (!verificationToken) return {
            success: false,
            message: "Reset hasła nie powiódł się. Spróbuj ponownie."
        }

        const result = await SendResetPasswordEmail(verificationToken)

        if (!result.success) return result
    }

    return {
        success: true,
        message: "Jeśli podany e-mail jest w bazie, został wysłany link resetujący hasło"
    }
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

export const CheckLoginOrRedirect = async () => {
    const session = await auth()

    if (!session?.user.id) return redirect("/auth/start")

    return session.user
}

export const CheckLoginReturnUser = async () => {
    const session = await auth()
    return session?.user
}