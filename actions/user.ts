"use server"

import { prisma } from "@/lib/prisma"
import { RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { GenerateVerificationToken } from "./tokens"
import { SendRegisterNewUserEmail } from "./resend"

export const GetUserByEmail = async (email:string) => {
    try {
        return await prisma.user.findUnique({
            where: {email: email}
        })
    } catch(error) {
        return null
    }
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