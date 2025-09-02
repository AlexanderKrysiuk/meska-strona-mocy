"use server"

import { prisma } from "@/lib/prisma"
import { AddUserToCircleSchema, DeleteUserFromCircleSchema, RegisterSchema, RestoreUserToCircleSchema } from "@/schema/user"
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
        currency: m.currency
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

export const DeleteUserFromCircle = async (data: z.infer<typeof DeleteUserFromCircleSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by usunąć użytkownika"
    }

    const membership = await GetCircleMembershipById(data.membershipId) 

    if (!membership) return {
        success: false,
        message: "Nie znaleziono informacji o członkostwie"
    }

    const member = await GetUserByID(membership.userId)

    if (!member) return {
        success: false,
        message: "Nie znaleziono danych o kręgowcu"
    }

    const circle = await GetCircleById(membership.circleId)

    if (!circle) return {
        success: false,
        message: "Brak informacji o kręgu"
    }

    if (!(user.roles.includes(Role.Moderator) && circle.moderatorId === user.id)) return { 
        success: false, 
        message: "Brak uprawnień do usunięcia użytkownika" 
    }

    const futureMeetings = await GetFutureMeetingsForUserInCircle(member.id, circle.id)

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

            // 3. Zwrot pieniędzy na saldo użytkownika
            if (totalRefund > 0) {
                await tx.user.update({
                    where: { id: member.id },
                    data: { balance: { increment: totalRefund } },
                });
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
        await resend.emails.send({
            from: "Męska Strona Mocy <info@meska-strona-mocy.pl>",
            to: member.email,
            subject: `Usunięcie z kręgu - ${circle.name}`,
            react: DeleteUserFromCircleEmail({
                name: member.name,
                circleName: circle.name,
                moderatorName: user?.name,
                reason: data.reason
            })
        })
    } catch (error) {
        console.error(error )
    }

    return {
        success: true,
        message: "Użytkownik został usunięty z kręgu"
    }
}

export const RestoreUserToCircle = async (data: z.infer<typeof RestoreUserToCircleSchema>) => {
    const moderator = await CheckLoginReturnUser()

    if (!moderator) return {
        success: false,
        message: "Musisz być zalogowanym by usunąć użytkownika"
    }

    const member = await GetUserByID(data.userId)

    if (!member) return {
        success: false,
        message: "Brak informacji o podanym kręgowcu"
    }

    const circle = await GetCircleById(data.circleId)

    if (!circle) return {
        success: false,
        message: "Brak informacji o podanym kręgu"
    }

    if (!(moderator.roles.includes(Role.Moderator) && circle.moderatorId === moderator.id)) return { 
        success: false, 
        message: "Brak uprawnień do usunięcia użytkownika" 
    }

    const futureMeetings = await GetCircleFutureMeetingsByCircleID(circle.id) || []

    try {
        await prisma.$transaction(async (tx) => {
            await tx.circleMembership.update({
                where: {
                    userId_circleId: {
                        circleId: circle.id,
                        userId: member.id
                    }
                },
                data: {
                    status: CircleMembershipStatus.Active
                }
            })
            for (const meeting of futureMeetings) {
                await tx.circleMeetingParticipant.upsert({
                    where: {
                        userId_meetingId:{
                            userId: member.id,
                            meetingId: meeting.id
                        }
                    },
                    update: {
                        status: MeetingParticipantStatus.Pending
                    },
                    create: {
                        userId: member.id,
                        meetingId: meeting.id
                    }
                })
            }
        })

        try {
            await resend.emails.send({
                from: "Męska Strona Mocy <info@meska-strona-mocy.pl>",
                to: member.email,
                subject: `Witamy ponownie w kręgu - ${circle.name}`,
                react: WelcomeBackToCircleEmail({
                    name: member.name,
                    circleName: circle.name,
                    meetings: futureMeetings
                })    
            })
        } catch(error) {
            console.error(error)
        }

        return {
            success: true,
            message: "Przywrócono pomyślnie użytkownika do kręgu"
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: "Nie udało się przywrócić użytkownika"
        }
    }
}