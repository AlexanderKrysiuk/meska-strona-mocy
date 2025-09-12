"use server"

import { prisma } from "@/lib/prisma"
import { AddUserToCircleSchema, EditUserSchema, RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { GenerateVerificationToken } from "./tokens"
import { GetCircleById, GetCircleMembershipById } from "./circle"
import { CheckLoginReturnUser } from "./auth"
import { PermissionGate } from "@/utils/gate"
import { resend, sendEmail } from "@/lib/resend"
import DeleteUserFromCircleEmail from "@/components/emails/DeleteUserFromCircle"
import { GetCircleFutureMeetingsByCircleID } from "./meeting"
import WelcomeToCircleEmail from "@/components/emails/WelcomeToCircle"
import { GetFutureMeetingsForUserInCircle } from "./meeting-participants"
import WelcomeBackToCircleEmail from "@/components/emails/WelcomeBackToCircle"
import WelcomeEmail from "@/components/emails/Welcome"
import { CircleMembershipStatus, MeetingParticipantStatus, Role } from "@prisma/client"
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

export const QueryGetUserByID = async (ID:string) => {
    try {
        return await prisma.user.findUnique({
            where: {id: ID},
            select: {
                name: true,
                image: true,
                description: true
            }
        })
    } catch (error) {
        console.error(error)
        throw new Error ("Błąd połączenia z bazą danych")
    }
}

export const GetUserByID = async (id:string) => {
    try {
        return await prisma.user.findUnique({where: {id: id}})
    } catch {
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

export const AddNewUserToCircle = async(data: z.infer<typeof AddUserToCircleSchema>) => {
    //const result = await RegisterNewUser({ email: data.email, name: data.name})
    //if (!result.success) return result

    let user = await GetUserByEmail(data.email)
    if (!user) { //return { success: false, message: "Nie znaleziono użytkownika" }
        try {
            user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email
                }
            })
        } catch (error) {
            console.error(error)
            return {
                success: false,
                message: "Rejestracja nie powiodła się. Spróbuj ponownie."
            }
        }
    }

    if (!user.emailVerified) {
        try {
            const token = await GenerateVerificationToken(user.email)
            if (!token) return {
                success: false,
                message: "Rejestracja nie powiodła się. Spróbuj ponownie."
            }
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
            return {
                success: false,
                message: "Rejestracja nie powiodła się. Spróbuj ponownie."
            }
        }
    }
    
    const circle = await GetCircleById(data.circleId)
    if (!circle) return { success: false, message: "Podany krąg nie został znaleziony"}

    const moderator = await GetUserByID(circle.moderatorId)
    if (!moderator) return { success: false, message: "Nie znaleziono moderatora"}

    const futureMeetings = await GetCircleFutureMeetingsByCircleID(circle.id) || []

    const formattedMeetings = futureMeetings.map(m => ({
        id: m.id,
        startTime: m.startTime,
        endTime: m.endTime,
        locale: m.city.region.country.locale,
        timeZone: m.city.region.country.timeZone,
        street: m.street,
        city: m.city.name,
        currencyId: m.currencyId
      }));

    try {
        await prisma.circleMembership.create({
            data: {
                circleId: circle.id,
                userId: user.id,
                status: CircleMembershipStatus.Active
            }
        })

        if (futureMeetings?.length > 0) {
            await prisma.circleMeetingParticipant.createMany({
                data: futureMeetings.map((meeting) => ({
                    meetingId: meeting.id,
                    userId: user.id,
                    currencyId: meeting.currencyId
                })),
                skipDuplicates: true
            })
        }

        try {
            await sendEmail({
                to: user.email,
                subject: `Witamy w kręgu - ${circle.name}`,
                react: WelcomeToCircleEmail({
                    member: {
                        name: user.name
                    },
                    moderator: {
                        name: moderator.name,
                        avatarUrl: moderator.image,
                        title: moderator.title
                    },
                    circle: {
                        name: circle.name
                    },
                    meetings: formattedMeetings
                })   
            })
        } catch(error) {
            console.error(error)
        }

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