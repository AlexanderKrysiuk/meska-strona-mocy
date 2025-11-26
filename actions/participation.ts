"use server"

import { ServerAuth } from "./auth"
import { prisma } from "@/lib/prisma"
import { Currency, MeetingStatus, ParticipationStatus, Role } from "@prisma/client"
import { GetMembershipByUserIdAndCircleId } from "./membership"

export const ToggleVacationStatus = async (participationID: string) => {
    try {
        const auth = await ServerAuth()

        const participation = await GetParticipationByID(participationID)
        if (!participation) return { success: false, message: "Brak informacji o uczestnictwie"}

        if (!(auth.roles.includes(Role.Admin) || (auth.roles.includes(Role.Moderator) && auth.id === participation.meeting.moderator.id) || auth.id === participation.user.id)) return { success: false, message: "Brak uprawnień do wykonania tej czynności"}

        //if (participation.meeting.status !== MeetingStatus.Scheduled) return { success: false, message: "Spotkanie zostało zakończone"}

        await prisma.$transaction(async (tx) => {
            switch (participation.status) {
                case ParticipationStatus.Vacation:
                    await tx.participation.update({
                        where: { id: participationID },
                        data: { status: ParticipationStatus.Active }
                    })
                    await tx.membership.update({
                        where: { userId_circleId: {
                            userId: participation.user.id,
                            circleId: participation.meeting.circle.id,
                        }},
                        data: { vacationDays: { increment: 1 }}
                    })
                    break;
                
                case ParticipationStatus.Active:
                    const membership = await GetMembershipByUserIdAndCircleId(participation.user.id, participation.meeting.circle.id)
                    if (!membership) return { success: false, message: "Brak informacji o członkostwie"}
                    if (auth.id === participation.user.id && membership.vacationDays <= 0) return { success: false, message: "Nie masz już dni urlopowych do wykorzystania"}
                    
                    await tx.participation.update({
                        where: {id: participation.id},
                        data: { status: ParticipationStatus.Vacation}
                    })

                    for (const payment of participation.payments) {
                        await tx.membershipBalance.create({
                            data: {
                                membershipId: membership.id,
                                amount: payment.amount,
                                currency: payment.currency,
                                stripePaymentId: payment.stripePaymentId,
                                method: payment.method,
                            }
                        });
                
                        // usuwamy wpłatę z ParticipationPayment
                        await tx.participationPayment.delete({ where: { id: payment.id } });
                    }

                    await tx.membership.update({
                        where: { id: membership.id },
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

export const GetParticipationsByIds = async (Ids: string[]) => {
    return await prisma.participation.findMany({
        where: { id: { in: Ids }},
        select: {
            id: true,
            meeting: { select: {
                price: true,
                currency: true
            }},
            payments: { select: {
                amount: true,
                currency: true
            }}
        }
    })
}

export const GetParticipationById = async (Id: string) => {
    return await prisma.participation.findUnique({
        where: { id: Id },
        select: {
            id: true,
            status: true,
            membership: { select: {
                id: true,
                user: { select: {
                    id: true
                }}
            }},
            payments: { select: {
                id: true,
                amount: true,
                currency: true,
                method: true,
                stripePaymentId: true,
            }},
            meeting: { select: {
                status: true,
                price: true,
                currency: true,
                moderator: { select: {
                    id: true,
                    stripeAccountId: true
                }},
                circle: { select: {
                    id: true
                }}
            }}
        }
    })
}

export const GetParticipantsByMeetingID = async (meetingID: string) => {
    const participants =  await prisma.participation.findMany({
        where: {meetingId: meetingID},
        select: {
            id: true,
            status: true,
            membership: {
                select: {
                    user: {
                        select: {
                            name: true,
                            image: true,
                            email: true,
                        }
                    }
                }
            }
        }
    })
    
    return participants

    // return participants.map(p => {
    //     const totalInMeetingCurrency = p.payments
    //         .filter(payment => payment.currency === p.meeting.currency)
    //         .reduce((sum, payment) => sum + payment.amount, 0);

    //     return {
    //         ...p,
    //         totalInMeetingCurrency
    //     };
    // });
}

export const GetParticipationsByUserId = async (userId: string) => {
    return await prisma.participation.findMany({
        where: { membership: { userId: userId }},
        select: {
            id: true,
            meeting: { select: {
                startTime: true,
                endTime: true,
                street: true,
                price: true,
                currency: true,
                city: { select: {
                    name: true, 
                    region: { select: { 
                        country: { select: {
                            timeZone: true
                        }}
                    }}
                }},
                circle: { select: {
                    name: true
                }},
            }},
            payments: { select: {
                amount: true,
                currency: true
            }},
            membership: { select: {
                id: true,
            }}
        }
    })
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
            //amountPaid: true,
            meeting: { select: {
                currency: true
            }}
        }
    })
}

export const GetTotalParticipationPaid = async ({
    participationId,
    currency
} : {
    participationId: string,
    currency: Currency
}) => {
    const total = await prisma.participationPayment.aggregate({
        where: {
            participationId: participationId,
            currency: currency
        },
        _sum: { amount: true }
    })
    return total._sum.amount || 0
}