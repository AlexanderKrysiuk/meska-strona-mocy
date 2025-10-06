"use server"

import { ServerAuth } from "./auth"
import { prisma } from "@/lib/prisma"
import { MeetingStatus, ParticipationStatus, Role } from "@prisma/client"
import { GetMembershipByUserIdAndCircleId } from "./membership"

export const ToggleVacationStatus = async (participationID: string) => {
    try {
        const auth = await ServerAuth()

        const participation = await GetParticipationByID(participationID)
        if (!participation) return { success: false, message: "Brak informacji o uczestnictwie"}

        if (!(auth.roles.includes(Role.Admin) || (auth.roles.includes(Role.Moderator) && auth.id === participation.meeting.moderatorId) || auth.id === participation.userId)) return { success: false, message: "Brak uprawnień do wykonania tej czynności"}

        if (participation.meeting.status !== MeetingStatus.Scheduled) return { success: false, message: "Spotkanie zostało zakończone"}

        await prisma.$transaction(async (tx) => {
            switch (participation.status) {
                case ParticipationStatus.Vacation:
                    await tx.participation.update({
                        where: { id: participationID },
                        data: { status: ParticipationStatus.Active }
                    })
                    await tx.membership.update({
                        where: { userId_circleId: {
                            userId: participation.userId,
                            circleId: participation.meeting.circleId,
                        }},
                        data: { vacationDays: { increment: 1 }}
                    })
                    break;
                
                case ParticipationStatus.Active:
                    const membership = await GetMembershipByUserIdAndCircleId(auth.id, participation.meeting.circleId)
                    if (!membership) return { success: false, message: "Brak informacji o członkostwie"}
                    if (auth.id === participation.userId) {
                        if (membership.vacationDays <= 0) {
                            return { success: false, message: "Nie masz już dni urlopowych do wykorzystania"}
                        }
                    }
                    await tx.participation.update({
                        where: { id: participationID },
                        data: { status: ParticipationStatus.Vacation }
                    })
                    if (participation.amountPaid > 0) {
                        await tx.membershipBalance.upsert({
                            where: { membershipId_currency: {
                                membershipId: membership.id,
                                currency: participation.meeting.currency
                            }},
                            update: { amount: { increment: participation.amountPaid }},
                            create: {
                                membershipId: membership.id,
                                currency: participation.meeting.currency,
                                amount: participation.amountPaid
                            }
                        })
                    }
                    await tx.membership.update({
                        where: { userId_circleId: {
                            userId: participation.userId,
                            circleId: participation.meeting.circleId
                        }},
                        data: { vacationDays: { decrement: 1 }}
                    })
                    break;

                default: return { success: false, message: "Nieobsługiwany status uczestnika" }
            }
        })
        return { success: true, message: "Zmieniono status urlopowy"}
    } catch (error) {
        return { success: false, message: "Błąd połączenia z bazą danych" }
    }
}

export const GetParticipationByID = async (ID: string) => {
    return await prisma.participation.findUnique({
        where: { id: ID },
        select: {
            id: true,
            amountPaid: true,
            status: true,
            userId: true,
            meeting: { select: {
                status: true,
                price: true,
                currency: true,
                moderatorId: true,
                circleId: true,
                moderator: { select: {
                    stripeAccountId: true
                }}
            }}
        }
    })
}

export const GetParticipantsByMeetingID = async (meetingID: string) => {
    return await prisma.participation.findMany({
        where: {meetingId: meetingID},
        select: {
            id: true,
            userId: true,
            meetingId: true,
            status: true,
            amountPaid: true,
            user: { select: {
                id: true,
                email: true,
                name: true,
                image: true,
            }}
        }
    })
}

export const GetMyUnpaidParticipations = async () => {
    const auth = await ServerAuth()
  
    const participations = await prisma.participation.findMany({
        where: { 
            userId: auth.id,
            status: ParticipationStatus.Active,
        },
        select: {
            id: true,
            amountPaid: true,
            meeting: { select: {
                startTime: true,
                endTime: true,
                street: true,
                price: true,
                currency: true,
                circle: { select: { name: true }},
                city: { select: {
                    name: true,
                    region: { select: { country: { select: { timeZone: true }}}}
                }}
            }}
        },
        orderBy: { meeting: { startTime: "asc" }}
    })
  
    // tu dopiero odfiltrowujesz nieopłacone
    return participations.filter(p => p.amountPaid < p.meeting.price)
  }
  
export const GetFutureParticipationsByUserIDAndCircleID = async (userID: string, circleID: string) => {
    return await prisma.participation.findMany({
        where: {
            userId: userID,
            meeting: { 
                circleId: circleID,
                startTime: { gte: new Date() }
            }
        },
        select: {
            id: true,
            amountPaid: true,
            meeting: { select: {
                currency: true
            }}
        }
    })
}