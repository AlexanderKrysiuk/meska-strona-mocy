"use server"

import { prisma } from "@/lib/prisma"
import { EditUserSchema, RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { GenerateVerificationToken, GetVerificationToken } from "./tokens"
import { CheckLoginReturnUser, ServerAuth } from "./auth"
import { SendRegisterNewUserEmail } from "./resend"
import { sendEmail } from "@/lib/resend"
import WelcomeEmail from "@/components/emails/Welcome"

export const GetUserByEmail = async (email:string) => {
    return await prisma.user.findUnique({
        where: {email: email}
    })
}

export const GetUserByID = async (id:string) => {
    return await prisma.user.findUnique({
        where: { id: id },
        select: {
            name: true,
            email: true,
            image: true,
            phone: true,
            memberships: {
                select: {
                    id: true
                }
            },
            moderatedCircles: {
                select: {
                    id: true
                }
            }
        }
    })
}

export const CreateOrGetUser = async (data: z.infer<typeof RegisterSchema>) => {
    let user = await GetUserByEmail(data.email)

    if (!user) {
        user = await prisma.user.create({ data })
    }

    if (!user.emailVerified) {
        const token = await GenerateVerificationToken(user.email)
        if (token) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: "Witamy - Męska Strona Mocy",
                    react: WelcomeEmail({
                        token: token,
                        name: user.name
                    })
                })
            } catch (error) {
                console.error(error)
            }
        }
    }

    return user
}

export const RegisterNewUser = async (data: z.infer<typeof RegisterSchema>) => {

    await CreateOrGetUser(data)

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