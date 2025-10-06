"use server"

import { SendMemberToVacationSchema } from "@/schema/moderator"
import { z } from "zod"
import { CheckLoginReturnUser, ServerAuth } from "./auth"
import { prisma } from "@/lib/prisma"
import { AddMembershipByModeratorSchema, RemoveMembershipSchema, RestoreMembershipSchema } from "@/schema/membership"
import { Currency, MembershipStatus, ParticipationStatus, Role } from "@prisma/client"
import { sendEmail } from "@/lib/resend"
import DeleteUserFromCircleEmail, { RemoveMembershipEmail } from "@/components/emails/Remove-Membership"
import WelcomeBackToCircleEmail from "@/components/emails/WelcomeBackToCircle"
import { GetCircleByID } from "./circle"
import { GetUserByEmail, RegisterNewUser } from "./user"
import { GetFutureParticipationsByUserIDAndCircleID } from "./participation"
import { textInputRule } from "@tiptap/react"
import { MembershipConfirmationEmail } from "@/components/emails/Membership-Confirmation"

export const GetCircleMembersByCircleID = async (ID:string) => {
    try {
        return await prisma.membership.findMany({
            where: {circleId: ID},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    }
                },
                circle: {
                    select: {
                        id: true,
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

export const AddMembershipByModerator = async (data: z.infer<typeof AddMembershipByModeratorSchema>) => {
    try {
        const auth = await ServerAuth()

        const circle = await GetCircleByID(data.circleId)
        if (!circle) return { success: false, message: "Brak danych o kręgu" }

        if (!auth.roles.includes(Role.Admin) && (auth.id !== circle.moderatorId || !auth.roles.includes(Role.Moderator))) return { success: false, message: "Brak uprawnień" }
    
        // Spróbuj pobrać użytkownika
        let user = await GetUserByEmail(data.email)

        // Jeśli nie istnieje, od razu zarejestruj
        if (!user) {
            await RegisterNewUser({ email: data.email, name: data.name}) 
            user = await GetUserByEmail(data.email) // odświeżamy userId
        }

        if (!user) return { success: false, message: "Brak danych o użytkowniku"}

        await prisma.membership.create({
            data: {
                userId: user.id,
                circleId: circle.id,
                status: MembershipStatus.Pending
            }
        }) 

        try {
            await sendEmail({
                to: user.email,
                subject: `Dołączenie do kręgu - ${circle.name}`,
                react: MembershipConfirmationEmail({
                    member: user,
                    circle: circle,
                    moderator: circle.moderator,
                })
            })
        } catch (error) {
            console.error(error)
        }
        
        return { success: true, message: "Użytkownik dodany do kręgu (oczekuje na akceptację)" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Wystąpił błąd podczas dodawania użytkownika do kręgu" }
    }
}

export const RemoveMembership = async (data: z.infer<typeof RemoveMembershipSchema>) => {
    try {
        const auth = await ServerAuth()

        const membership = await GetMembershipByID(data.membershipId)
        if (!membership) return { success: false, message: "Brak danych o członkostwie"}
        
        if (!auth.roles.includes(Role.Admin) && (auth.id !== membership.circle.moderatorId || !auth.roles.includes(Role.Moderator))) return { success: false, message: "Brak uprawnień" }

        const participations = await GetFutureParticipationsByUserIDAndCircleID(membership.user.id, membership.circle.id)

        await prisma.$transaction(async (tx) => {
            await tx.membership.update({
                where: { id: membership.id },
                data: { status: MembershipStatus.Removed }
            })
            
            if (participations.length > 0) {
                for (const participation of participations) {
                    if (participation.amountPaid > 0) {
                        await tx.membershipBalance.upsert({
                            where: { membershipId_currency: {
                                membershipId: membership.id,
                                currency: participation.meeting.currency
                            }},
                            update: {
                                amount: { increment: participation.amountPaid }
                            },
                            create: {
                                membershipId: membership.id,
                                currency: participation.meeting.currency,
                                amount: participation.amountPaid
                            }
                        })
                        await tx.participation.update({
                            where: { id: participation.id },
                            data: { 
                                amountPaid: 0,
                                status: ParticipationStatus.Cancelled
                            }
                        })
                    }
                }
            }
        })

        if (membership.status !== MembershipStatus.Pending) {
            try {
                await sendEmail({
                    to: membership.user.email,
                    subject: `Usunięcie z kręgu - ${membership.circle.name}`,
                    react: RemoveMembershipEmail({
                        member: membership.user,
                        circle: membership.circle,
                        moderator: membership.circle.moderator,
                        reason: data.reason
                    })
                })
            } catch (error) {
                console.error(error)
            }
        }
            
        return {
            success: true,
            message: "Użytkownik został usunięty z kręgu"
        }
    } catch(error) {
        console.error(error)
        return {
            success: false,
            message: "Wystąpił błąd podczas usuwania użytkownika z kręgu"
        }
    }
}

export const RestoreMembership = async (data: z.infer<typeof RestoreMembershipSchema>) => {
    try {
        const auth = await ServerAuth()

        const membership = await GetMembershipByID(data.membershipId)
        if (!membership) return { success: false, message: "Brak danych o członkostwie"}
        
        if (!auth.roles.includes(Role.Admin) && (auth.id !== membership.circle.moderatorId || !auth.roles.includes(Role.Moderator))) return { success: false, message: "Brak uprawnień" }
    
        await prisma.membership.update({
            where: { id: membership.id },
            data: { status: MembershipStatus.Pending }
        })

        try {
            await sendEmail({
                to: membership.user.email,
                subject: `Dołączenie do kręgu - ${membership.circle.name}`,
                react: MembershipConfirmationEmail({
                    member: membership.user,
                    circle: membership.circle,
                    moderator: membership.circle.moderator,
                })
            })
        } catch (error) {
            console.error(error)
        }

        return { success: true, message: "Użytkownik przywrócony do kręgu (oczekuje na akceptację)" }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: "Wystąpił błąd podczas przywracania użytkownika do kręgu"
        }
    }
}

export const GetMembers = async ({
    circleID,
    status,
} : {
    circleID?: string
    status?: MembershipStatus
}) => {
    return prisma.membership.findMany({
        where: {
            ...(circleID && { circleId: circleID }),
            ...(status && { status }),
        },
    })
}

export const GetMembershipByID = async (membershipID: string) => {
    return await prisma.membership.findUnique({
        where: { id: membershipID },
        select: {
            id: true,
            status: true,
            user: { select: {
                id: true,
                name: true,
                email: true,
            }},
            circle: { select: {
                id: true,
                name: true,
                moderatorId: true,
                moderator: { select: {
                    name: true,
                    image: true,
                    title: true
                }}
            }}
        }
    })
}
  
export const GetMembershipByUserIdAndCircleId = async (userId: string, circleId: string) => {
    return await prisma.membership.findUnique({
        where: { userId_circleId: {
            userId: userId,
            circleId: circleId
        }},
        select: {
            id: true,
            vacationDays: true
        }
    })
}

export const GetMyMemberships = async () => {
    const auth = await ServerAuth()
    return await prisma.membership.findMany({
        where: { userId: auth.id },
        select: {
            id: true,
            vacationDays: true,
            circle: { select: {
                name: true
            }}
        }
    })
}