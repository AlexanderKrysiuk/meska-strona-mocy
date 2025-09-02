"use server"

import { SendMemberToVacationSchema } from "@/schema/moderator"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { prisma } from "@/lib/prisma"
import { DeleteMemberFromCircleSchema } from "@/schema/member"
import { CircleMembershipStatus, Currency, MeetingParticipantStatus, Role } from "@prisma/client"
import { GetFutureMeetingsForUserInCircle } from "./meeting-participants"
import { sendEmail } from "@/lib/resend"
import DeleteUserFromCircleEmail from "@/components/emails/DeleteUserFromCircle"

export const SendMemberToVacation = async (data: z.infer<typeof SendMemberToVacationSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }

    const dane = await prisma.circleMeetingParticipant.findUnique({
        where: {id: data.participationID},
        include: {
            meeting: {
                include: {
                    circle: true
                }
            }
        }
    })
}

export const GetCircleMembersByCircleID = async (ID:string) => {
    try {
        return await prisma.circleMembership.findMany({
            where: {circleId: ID},
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        email: true,
                    }
                },
                circle: {
                    select: {
                        name: true
                    }
                }
            }
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

export const GetCircleMembershipByID = async (ID:string) => {
    try {
        return await prisma.circleMembership.findUnique({
            where: {id: ID},
            include: {
                user: true,
                circle: true
            }
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

export const DeleteMemberFromCircle = async (data: z.infer<typeof DeleteMemberFromCircleSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by usunąć użytkownika"
    }

    const membership = await GetCircleMembershipByID(data.membershipId) 

    if (!membership) return {
        success: false,
        message: "Nie znaleziono informacji o członkostwie"
    }

    if (!(user.roles.includes(Role.Moderator) && membership.circle.moderatorId === user.id)) return { 
        success: false, 
        message: "Brak uprawnień do usunięcia użytkownika" 
    }

    const futureMeetings = await GetFutureMeetingsForUserInCircle(membership.user.id, membership.circle.id)

    try {
        const totalRefund = futureMeetings.reduce((sum, p) => sum + p.amountPaid, 0);

        await prisma.$transaction(async (tx) => {
            // 1. Zmieniamy status członkostwa
            await tx.circleMembership.update({
                where: { id: membership.id },
                data: { status: CircleMembershipStatus.Removed }
            });

            // 2. Aktualizujemy uczestnictwo w przyszłych spotkaniach
            for (const participant of futureMeetings) {
                await tx.circleMeetingParticipant.update({
                    where: { id: participant.id },
                    data: { status: MeetingParticipantStatus.Cancelled, amountPaid: 0 },
                });
            }

            // 3. Grupujemy refund per currency
            const refundsByCurrency = futureMeetings.reduce<Record<string, number>>((acc, p) => {
                acc[p.currency] = (acc[p.currency] || 0) + p.amountPaid;
                return acc;
            }, {});

            // 4. Zwrot do tabeli Balance
            for (const [currency, amount] of Object.entries(refundsByCurrency)) {
                if (amount > 0) {
                    await tx.balance.upsert({
                        where: {
                            userId_currency: {
                                userId: membership.user.id,
                                currency: currency as Currency,
                            }
                        },
                        update: {
                            amount: { increment: amount },
                        },
                        create: {
                            userId: membership.user.id,
                            currency: currency as Currency,
                            amount,
                        },
                    });
                }
            }
        });
    } catch(error) {
        console.log(error)
        return {
            success: false,
            message: "Nie udało się usunąć użytkownika z kręgu"
        }
    }

    try {
        await sendEmail({
            to: membership.user.email,
            subject: `Usunięcie z kręgu - ${membership.circle.name}`,
            react: DeleteUserFromCircleEmail({
                name: membership.user.name,
                circleName: membership.circle.name,
                moderatorName: user.name,
                reason: data.reason
            })
        })
    } catch (error) {
        console.error(error)
    }

    return {
        success: true,
        message: "Użytkownik został usunięty z kręgu"
    }
}

export const GetMemberWithMeetingAndCircleByParticipationID = async (ID:string) => {
    
}