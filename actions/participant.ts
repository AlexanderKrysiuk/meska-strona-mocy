"use server"

import { SendParticipantToVacationSchema } from "@/schema/participant"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { prisma } from "@/lib/prisma"
import { MeetingParticipantStatus, Role } from "@prisma/client"
import { sendEmail } from "@/lib/resend"
import SendParticipantToVacationEmail from "@/components/emails/send-participant-to-vacation-email"

export const SendParticipantToVacation = async (data: z.infer<typeof SendParticipantToVacationSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }

    const participation = await GetParticipationByID(data.participationID)
    if (!participation) return { success: false, message: "Nie znaleziono danych o uczestnictwie"}

    if (!(user.roles.includes(Role.Admin) || (user.roles.includes(Role.Moderator) && user.id === participation.meeting.moderatorId))) return { success: false, message: "Brak uprawnień do wykonania tej czynności"}

    try {
        await prisma.$transaction(async (tx) => {
            await tx.balance.upsert({
                where: { userId_currency: { userId: participation.userId, currency: participation.meeting.currency }},
                update: { amount: { increment: participation.amountPaid }},
                create: { userId: participation.userId, amount: participation.amountPaid, currency: participation.meeting.currency }
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
                    city: { include: { region: { include: { country: true }}}}
                }
            }}
        })
    } catch (error) {
        console.error(error)
        return null
    }
}