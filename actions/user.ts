"use server"

import { prisma } from "@/lib/prisma"
import { EditUserSchema, RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { GenerateVerificationToken } from "./tokens"
import { CheckLoginReturnUser, ServerAuth } from "./auth"
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
    const auth = await ServerAuth()
    if (!auth) return { success: false, message: "Musisz być zalogowany"}

    const role = auth.roles && auth.roles.length > 0

    if (data.slug) {
        const existingSlug = await checkPartnerSlug(data.slug)
        if (existingSlug) return {
            success: false,
            message: "Nie udało się zaktualizować grupy",
            fieldErrors: { slug: "Podany odnośnik jest już zajęty"}
        }
    }

    try {
        await prisma.user.update({
            where: { id: auth.id },
            data: {
                name: data.name,
                slug: role ? data.slug : null,
                description: role ? data.description : null
            }
        })
        return { success: true, message: "Zaktualizowano dane"}
    } catch (error) {
        console.error(error)
        return { success: false, message: "Błąd połączenia z bazą danych"}
    }
}

const checkPartnerSlug = async (slug: string) => {
    const auth = await ServerAuth()
    const existing =  await prisma.user.findFirst({
        where: { slug: slug },
        select: { id: true }
    })

    if (!existing) return false
    return existing.id !== auth.id
}