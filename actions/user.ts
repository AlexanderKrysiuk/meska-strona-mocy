"use server"

import { prisma } from "@/lib/prisma"
import { AddUserToCircle, RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { GenerateVerificationToken } from "./tokens"
import { SendRegisterNewUserEmail, SendWelcomeToCircleEmail } from "./resend"
import { CircleMembershipStatus } from "@prisma/client"
import { GetCircleById } from "./circle"

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

export const AddNewUserToCircle = async(data: z.infer<typeof AddUserToCircle>) => {
    const result = await RegisterNewUser({ email: data.email, name: data.name})
    if (!result.success) return result

    const user = await GetUserByEmail(data.email)
    if (!user) return { success: false, message: "Nie znaleziono użytkownika" }

    const circle = await GetCircleById(data.circleId)
    if (!circle) return { success: false, message: "Podany krąg nie został znaleziony"}

    try {
        await prisma.circleMembership.create({
            data: {
                circleId: circle.id,
                userId: user.id,
                status: CircleMembershipStatus.Member
            }
        })
        await SendWelcomeToCircleEmail(user.email, circle.name, user.name ?? undefined)

        return {
            success: true,
            message: "Pomyślnie dodano nowego kręgowca"
        }
    } catch {
        return {
            success: false,
            message: "Nie udało się dodać użytkownika do kręgu"
        }
    }
}