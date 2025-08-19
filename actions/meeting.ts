"use server"

import { CompleteMeetingSchema, CreateMeetingSchema, EditMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { CircleMeetingStatus, CircleMembershipStatus, MeetingParticipantStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { GetCircleById } from "./circle"
import { PermissionGate } from "@/utils/gate"
import { GetActiveCircleMembersByCircleID } from "./circle-membership"
import { resend } from "@/lib/resend"
import { MeetingInvite } from "@/components/emails/Meeting-Invite"

export const CreateMeeting = async (data: z.infer<typeof CreateMeetingSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }
  
    // Sprawdzenie uprawnień
    if (!PermissionGate(user.roles, [Role.Moderator])) {
        return { success: false, message: "Brak uprawnień do dodania spotkania" }
    }

    const circle = await GetCircleById(data.circleId)
    if (!circle) return { success: false, message: "Dana grupa nie istnieje" }
  
    if (user.id !== circle.moderatorId) {
        return { success: false, message: "Brak uprawień do dodania spotkania" }
    }
  
    const activeMembers = (await GetActiveCircleMembersByCircleID(circle.id)) || []
  
    try {
         // Sprawdzenie nakładających się spotkań
        const overlapingMeeting = await prisma.circleMeeting.findFirst({
            where: {
                moderatorId: user.id,
                AND: [
                    { startTime: { lt: data.endTime } },
                    { endTime: { gt: data.startTime } },
                ],
            },
        })
        if (overlapingMeeting) {
            return {
                success: false,
                message: "Nie udało się dodać spotkania",
                errors: { startTime: ["W tym dniu masz już inne spotkanie"] },
            }
        }
  
        const existingMeetings = await prisma.circleMeeting.count({ where: { circleId: data.circleId } })
  
        // Przygotowanie uczestników
        const participantData =
            activeMembers.length > 0
            ? activeMembers.filter(m => m.user).map(m => ({
                user: { connect: { id: m.user.id } },
                status: MeetingParticipantStatus.Pending,
            }))
            : undefined
  
        // Tworzenie spotkania z uczestnikami
        const meeting = await prisma.circleMeeting.create({
            data: {
                status: CircleMeetingStatus.Scheduled,
                startTime: data.startTime,
                endTime: data.endTime,
                street: data.street,
                cityId: data.cityId,
                price: data.price,
                circleId: data.circleId,
                moderatorId: user.id,
                number: existingMeetings + 1,
                ...(participantData && { participants: { create: participantData } }),
            },
            include: {
                participants: { include: { user: true } },
                circle: true,
                moderator: true,
                city: { include: { region: { include: { country:true }}}}
            },
        })
  
        // Wysyłka maili w osobnym try/catch
        try {
            for (const participant of meeting.participants) {
                await resend.emails.send({
                    from: "Męska Strona Mocy <info@meska-strona-mocy.pl>",
                    to: participant.user.email,
                    subject: `Nowe spotkanie ${meeting.circle.name}`,
                    react: MeetingInvite({
                        userName: participant.user.name,
                        circleName: meeting.circle.name,
                        startTime: meeting.startTime,
                        endTime: meeting.endTime,
                        street: meeting.street,
                        city: meeting.city.name,
                        locale: meeting.city.region.country.locale,
                        price: meeting.price,
                        moderatorName: meeting.moderator?.name,
                        moderatorAvatarUrl: meeting.moderator?.image,
                    }),
                })
            }
        } catch (error) {
            console.error("Błąd przy wysyłce maili:", error)
        }
  
        return { success: true, message: "Pomyślnie dodano nowe spotkanie" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Błąd połączenia z bazą danych" }
    }
}
  
async function RefreshMeetingsNumbering (circleId: string) {
    const meetings = await prisma.circleMeeting.findMany({
        where: {circleId: circleId},
        orderBy: {startTime: "asc"}
    })

    for (let i = 0; i < meetings.length ; i++) {
        await prisma.circleMeeting.update({
            where: {id: meetings[i].id },
            data: { number: i+1 }
        })
    }
    return meetings.length
}

export const EditMeeting = async (data: z.infer<typeof EditMeetingSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by utworzyć spotkanie"
    }

    if (!PermissionGate(user.roles, [Role.Moderator])) return {
        success: false,
        message: "Brak uprawnień do edycji spotkania"
    }

    const meeting = await GetMeetingById(data.meetingId)

    if (!meeting) return {
        success: false,
        message: "Dane spotkanie nie istnieje"
    }

    if (PermissionGate(user.roles, [Role.Moderator]) && user.id !== meeting.moderatorId) return {
        success: false,
        message: "Brak uprawień do edycji spotkania"
    }

    try {
        const overlapingMeetings = await prisma.circleMeeting.findFirst({
            where: {
                moderatorId: user.id,
                AND: [
                    {
                        startTime: { lt: data.endTime }
                    },
                    {
                        endTime: { gt: data.startTime }
                    }
                ]
            }
        })

        if (overlapingMeetings) return {
            success: false,
            message: "Nie udało się edytować spotkania",
            errors: {
                startTime: ["W tym dniu masz już inne spotkanie"]
            }
        }

        await prisma.circleMeeting.update({
            where: { id: data.meetingId },
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                price: data.price,
                street: data.street,
                cityId: data.cityId
            }
        })

        await sortMeetings(meeting.circleId)

    } catch {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    return {
        success: true,
        message: "Pomyślnie zmieniono dane spotkania"
    }
}

// export const RegisterToMeeting = async (data: z.infer<typeof RegisterToMeetingSchema>) => {
//     let circle

//     try {
//         circle = await prisma.circle.findUnique({
//             where: {
//                 id: data.circleId
//             },
//             include: {
//                 _count: {
//                     select: {
//                         members: true
//                     }
//                 }
//             }
//         })
//     } catch (error) {
//         throw new Error("Błąd połączenia z bazą danych.");
//     }

//     if (!circle) throw new Error("Nie znaleziono grupy.")    
//     if (circle._count.members >= circle.maxMembers) throw new Error("Brak wolnych miejsc w tej grupie.");
    
//     let user

//     try {
//         user = await prisma.user.findUnique({
//             where: { email: data.email}
//         })
//     } catch (error) {
//         throw new Error("Błąd połączenia z bazą danych.");
//     }

//     if (!user) {
//         try {
//             user = await prisma.user.create({ data })
//         } catch (error) {
//             throw new Error("Rejestracja nie powiodła się. Spróbuj ponownie.")
//         }

//         try {
//             const verificationToken = await GenerateVerificationToken(data.email)
//             await sendVerificationEmail(verificationToken)
//         } catch (error) {
//             throw new Error("Nie udało się wysłać e-maila weryfikacyjnego.")
//         }
//     }


// }

export const GetMeetingById = async (id: string) => {
    try {
        return await prisma.circleMeeting.findUnique({ where: {id}})
    } catch (error) {
        return null
    }
}

export const sortMeetings = async (circleId: string) => {
    const meetings = await prisma.circleMeeting.findMany({
        where: {circleId: circleId},
        orderBy: { startTime: "asc"}
    })

    for (let i = 0; i < meetings.length; i++) {
        const meeting = meetings[i];
        await prisma.circleMeeting.update({
          where: { id: meeting.id },
          data: { number: i + 1 } // najstarszy = 1
        });
      }
}

export const CompleteMeeting = async (data: z.infer<typeof CompleteMeetingSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by zatwierdzić spotkanie"
    }

    if (!PermissionGate(user.roles, [Role.Moderator])) return {
        success: false,
        message: "Brak uprawnień do zatwierdzenia spotkania"
    }

    const meeting = await GetMeetingById(data.meetingId)

    if (!meeting) return {
        success: false,
        message: "Dana spotkanie nie istnieje"
    }

    if (PermissionGate(user.roles, [Role.Moderator]) && user.id !== meeting.moderatorId) return {
        success: false,
        message: "Brak uprawień do zatwierdzenia spotkania"
    }

    try {
        await prisma.circleMeeting.update({
            where: { id: data.meetingId },
            data: { status: CircleMeetingStatus.Completed }
        })
    } catch {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    return {
        success: true,
        message: "Pomyślnie zatwierdzono spotkanie"
    }
}