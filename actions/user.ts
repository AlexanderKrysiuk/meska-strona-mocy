"use server"

import { prisma } from "@/lib/prisma"
import { EditUserSchema, RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { GenerateVerificationToken } from "./tokens"
import { CheckLoginReturnUser } from "./auth"
import { SendRegisterNewUserEmail } from "./resend"

export const GetUserByEmail = async (email:string) => {
    return await prisma.user.findUnique({
        where: {email: email}
    })
}

export const GetUserByID = async (id:string) => {
    return await prisma.user.findUnique({
        where: { id: id }
    })
}

export const RegisterNewUser = async (data: z.infer<typeof RegisterSchema>) => {
    let existingUser = await GetUserByEmail(data.email)
    
    if (!existingUser) {
        try {
            existingUser = await prisma.user.create({ data })
        } catch {
            return {
                success: false,
                message: "Rejestracja nie powiodła się. Spróbuj ponownie."
            }
        }
    }

    if (!existingUser.emailVerified) {
        try {
            const token =  await GenerateVerificationToken(existingUser.email)
            if (!token) return {
                success: false,
                message: "Rejestracja nie powiodła się. Spróbuj ponownie."
            }
            await SendRegisterNewUserEmail(token, existingUser.name ?? undefined)
        } catch {
            return {
                success: false,
                message: "Rejestracja nie powiodła się. Spróbuj ponownie."
            }
        }
    }

    return {
        success: true,
        message: "Rejestracja udana, wysłaliśmy e-mail z dalszymi instrukcjami"
    }
}

export const UpdateUser = async (data: z.infer<typeof EditUserSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Nie znaleziono użytkownika"}

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                description: data.description
            }
        })
        return { success: true, message: "Zaktualizowano dane"}
    } catch (error) {
        console.error(error)
        return { success: false, message: "Błąd połączenia z bazą danych"}
    }
}