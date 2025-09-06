"use server"

import { ReturnParticipantFromVacationSchema, SendParticipantToVacationSchema } from "@/schema/participant"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { prisma } from "@/lib/prisma"
import { CircleMeetingStatus, MeetingParticipantStatus, Role } from "@prisma/client"
import { sendEmail } from "@/lib/resend"
import SendParticipantToVacationEmail from "@/components/emails/send-participant-to-vacation-email"
import ReturnParticipantFromVacationEmail from "@/components/emails/return-participant-from-vacation-email"

export const SendParticipantToVacation = async (data: z.infer<typeof SendParticipantToVacationSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }

    const participation = await GetParticipationByID(data.participationID)
    if (!participation) return { success: false, message: "Nie znaleziono danych o uczestnictwie"}

    if (!(user.roles.includes(Role.Admin) || (user.roles.includes(Role.Moderator) && user.id === participation.meeting.moderatorId))) return { success: false, message: "Brak uprawnień do wykonania tej czynności"}

    if (participation.meeting.status === CircleMeetingStatus.Completed) return { success: false, message: "Nie możesz edytować zakończonych spotkań"}

    try {
        await prisma.$transaction(async (tx) => {
            await tx.balance.upsert({
                where: { userId_currencyId: { userId: participation.userId, currencyId: participation.meeting.currencyId }},
                update: { amount: { increment: participation.amountPaid }},
                create: { userId: participation.userId, amount: participation.amountPaid, currencyId: participation.meeting.currencyId }
            })

            await tx.circleMeetingParticipant.update({
                where: { id: participation.id },
                data: { amountPaid: 0, status: MeetingParticipantStatus.Vacation }
            })

            await tx.circleMembership.update({
                where: { userId_circleId: { userId: participation.userId, circleId: participation.meeting.circle.id }},
                data: { vacationDays: { decrement: 1 }}
            })
        })
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    try {
        await sendEmail({
            to: participation.user.email,
            subject: `Twój urlop w ${participation.meeting.circle.name}`,
            react: SendParticipantToVacationEmail({
                user: participation.user,
                circle: participation.meeting.circle,
                meeting: participation.meeting,
                participation: participation
            })
        })
    } catch (error) {
        console.error(error)
    }

    return {
        success: true,
        message: "Pomyślnie wysłano kręgowca na urlop"
    }
}

export const ReturnParticipantFromVacation = async (data: z.infer<typeof ReturnParticipantFromVacationSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }

    const participation = await GetParticipationByID(data.participationID)
    if (!participation) return { success: false, message: "Nie znaleziono danych o uczestnictwie"}

    if (!(user.roles.includes(Role.Admin) || (user.roles.includes(Role.Moderator) && user.id === participation.meeting.moderatorId))) return { success: false, message: "Brak uprawnień do wykonania tej czynności"}

    try {
        await prisma.$transaction(async (tx) => {
            await tx.circleMeetingParticipant.update({
                where: { id: participation.id },
                data: { status: MeetingParticipantStatus.Active }
            })

            await tx.circleMembership.update({
                where: { userId_circleId: { userId: participation.userId, circleId: participation.meeting.circle.id }},
                data: { vacationDays: { increment: 1 }}
            })
        })
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    try {
        await sendEmail({
            to: participation.user.email,
            subject: `Powrót z urlopu w ${participation.meeting.circle.name}`,
            react: ReturnParticipantFromVacationEmail({
                user: participation.user,
                circle: participation.meeting.circle,
                meeting: participation.meeting,
                participation: participation
            })
        })
    } catch (error) {
        console.error(error)
    }

    return {
        success: true,
        message: "Pomyślnie przywrócono kręgowca z urlopu"
    }
}

export const GetParticipationByID = async (ID: string) => {
    try {
        return await prisma.circleMeetingParticipant.findUnique({
            where: { id: ID },
            include: { 
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                meeting: { include: {
                    circle : true,
                    city: { include: { region: { include: { country: true }}}},
                    currency: true
                }
            }}
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

export const GetFutureMemberParticipationsByCircleID = async (userID: string, circleID: string) => {
    try {
        return await prisma.circleMeetingParticipant.findMany({
            where: {
                userId: userID,
                meeting: {
                    circleId: circleID,
                    startTime: { gt: new Date() }
                }
            },
            include: { meeting: true }
        })
    } catch (error) {
        console.error(error)
        return []
    }
}