"use server"

import { CompleteMeetingSchema, CreateMeetingSchema, EditMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { CircleMeetingStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { GetCircleById } from "./circle"

export const CreateMeeting = async (data: z.infer<typeof CreateMeetingSchema>) => {    
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by utworzyć spotkanie"
    }

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return {
        success: false,
        message: "Brak uprawnień do dodania spotkania"
    }

    const circle = await GetCircleById(data.circleId)

    if (!circle) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (user.role === Role.Moderator && user.id !== circle.moderatorId) return {
        success: false,
        message: "Brak uprawień do dodania spotkania"
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

        if (overlapingMeetings) {
            //addActionError(errors, "startTime", "W tym czasie masz już inne spotkanie") 
            
            return {
                success: false,
                message: "Nie udało się dodać spotkania",
                errors: {
                    startTime: ["W tym dniu masz już inne spotkanie"]
                }
            }
        }

        // Policz ile spotkań już było w tej grupie
        const existingMeetings = await prisma.circleMeeting.count({
            where: { circleId: data.circleId },
        })
        
        await prisma.circleMeeting.create({
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
            }
        })
    } catch {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    //TODO podepnij resendera i dodaj wysyłkę maili informującą o nowych spotkaniach

    return {
        success: true,
        message: "Pomyślnie dodano nowe spotkanie"
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

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return {
        success: false,
        message: "Brak uprawnień do edycji spotkania"
    }

    const meeting = await GetMeetingById(data.meetingId)

    if (!meeting) return {
        success: false,
        message: "Dane spotkanie nie istnieje"
    }

    if (user.role === Role.Moderator && user.id !== meeting.moderatorId) return {
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

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return {
        success: false,
        message: "Brak uprawnień do zatwierdzenia spotkania"
    }

    const meeting = await GetMeetingById(data.meetingId)

    if (!meeting) return {
        success: false,
        message: "Dana spotkanie nie istnieje"
    }

    if (user.role === Role.Moderator && user.id !== meeting.moderatorId) return {
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