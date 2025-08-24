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
import MeetingUpdatedEmail from "@/components/emails/Meeting-update"
import { setTimeout } from "timers"
import { FormError } from "@/utils/errors"

export const CreateMeeting = async (data: z.infer<typeof CreateMeetingSchema>) => {
    setTimeout(()=>{},10000)
    
    const user = await CheckLoginReturnUser()
    if (!user) throw new Error("Musisz być zalogowanym by utworzyć spotkanie");
  
    
    const circle = await GetCircleById(data.circleId)
    if (!circle) throw new Error("Dana grupa nie istnieje");
    
    if (
        !user.roles.includes(Role.Admin) && (user.id !== circle.moderatorId || !user.roles.includes(Role.Moderator))
    ) throw new Error("Brak uprawnień do dodania spotkania");

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
            throw new FormError(
                { startTime: "W tym dniu masz już inne spotkanie" },
                "Nie udało się dodać spotkania"
            );
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
        return { message: "Spotkanie utworzone pomyślnie" };
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych");
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

    // Zapisujemy stare dane spotkania
    const oldMeetingData = {
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        street: meeting.street,
        city: meeting.city.name,
        price: meeting.price,
        locale: meeting.city.region.country.locale
    };



    try {
        const overlapingMeetings = await prisma.circleMeeting.findFirst({
            where: {
                moderatorId: user.id,
                AND: [
                    { startTime: { lt: data.endTime }},
                    { endTime: { gt: data.startTime }}
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

        const updatedMeeting = await prisma.circleMeeting.update({
            where: { id: data.meetingId },
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                price: data.price,
                street: data.street,
                cityId: data.cityId
            },
            include: { 
                participants: { include: { user: true }},
                city: { include: { region: { include: { country:true }}}}
            }
        })

        await sortMeetings(meeting.circleId)

        for (const participant of updatedMeeting.participants) {
            try {
                await resend.emails.send({
                    from: "Męska Strona Mocy <info@meska-strona-mocy.pl>",
                    to: participant.user.email,
                    subject: `Zmiana spotkania w kręgu ${meeting.circle.name}`,
                    react: MeetingUpdatedEmail({
                        userName: participant.user.name,
                        circleName: meeting.circle.name,
                        oldMeeting: oldMeetingData,
                        newMeeting: {
                            startTime: updatedMeeting.startTime,
                            endTime: updatedMeeting.endTime,
                            street: updatedMeeting.street,
                            city: updatedMeeting.city.name,
                            price: updatedMeeting.price,
                            locale: updatedMeeting.city.region.country.locale
                        },
                        moderatorName: user.name
                    })
                })
            } catch (error) {
                console.error(error)
            }
        }

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
        return await prisma.circleMeeting.findUnique({
            where: { id },
            include: { 
                city: { include: { region: { include: { country: true }}}},
                circle: true
            }
        })
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

export const GetCircleFutureMeetingsByCircleID = async (ID:string) => {
    try {
        return await prisma.circleMeeting.findMany({
            where: { 
                circleId:ID,
                startTime: { gte: new Date() }
            },
            include: { city: { include: { region: { include: { country: true }}}} },
            orderBy: { startTime: "asc" }
        })
    } catch(error) {
        console.error(error)
        return null
    }
}

export const GetMeetingWithMembersByMeetingID = async (meetingID:string) => {

    // opóźnienie 11 sekund
    //await new Promise(resolve => setTimeout(resolve, 11000));

    const moderator = await CheckLoginReturnUser() 
        
    // if (!moderator) return {
    //     success: false,
    //     message: "Musisz być zalogowanym by otrzymać dane o spotkaniu"
    // }
    
    if (!moderator) throw new Error("Musisz być zalogowany")
            
    //     if (!PermissionGate(moderator.roles, [Role.Moderator])) return {
    //     success: false,
    //     message: "Nie jesteś moderatorem"
    // }
    
    if (!PermissionGate(moderator.roles, [Role.Moderator])) throw new Error("Nie jesteś moderatorem")
        
    const meeting = await prisma.circleMeeting.findUnique({
        where: { id: meetingID },
        include: {
            city: { include: { region: { include: { country: true }}}},
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                            vacationDays: true
                        }
                    }
                }
            }
        }
    })

    // if (!meeting) return {
    //     success: false,
    //     message: "Podane spotkanie nie istnieje"
    // }

    if (!meeting) throw new Error("Podane spotkanie nie istnieje")

    // if (meeting.moderatorId !== moderator.id) return {
    //     success: false,
    //     message: "Nie jesteś moderatorem tego spotkania"
    // }

    if (meeting.moderatorId !== moderator.id) throw new Error("Nie jesteś moderatorem tego spotkania")

    return meeting
}

export const GetScheduledMeetingsByModeratorID = async (moderatorID: string) => {
    try {
        return await prisma.circleMeeting.findMany({
            where: {
                moderatorId: moderatorID,
                status: CircleMeetingStatus.Scheduled,
            },
            orderBy: { startTime: "asc" }
        })
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}

export const GetModeratorMeetingsByModeratorID = async (moderatorID: string, status?: CircleMeetingStatus) => {
    try {
        return await prisma.circleMeeting.findMany({
            where: {
                moderatorId: moderatorID,
                status: status
            },
            orderBy: { startTime: "asc" }
        })
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}