"use server"

import { CreateMeetingSchema, EditMeetingSchema, RegisterToMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { CheckLoginReturnUser, GenerateVerificationToken } from "./auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/nodemailer"
import { GetGroupById } from "./group"

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

    const group = await GetGroupById(data.groupId)

    if (!group) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (user.role === Role.Moderator && user.id !== group.moderatorId) return {
        success: false,
        message: "Brak uprawień do dodania spotkania"
    }

    try {
        const overlapingMeetings = await prisma.groupMeeting.findFirst({
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
        const existingMeetings = await prisma.groupMeeting.count({
            where: { groupId: data.groupId },
        })
        
        await prisma.groupMeeting.create({
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                street: data.street,
                cityId: data.cityId,
                price: data.price,
                groupId: data.groupId,
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

async function RefreshMeetingsNumbering (groupId: string) {
    const meetings = await prisma.groupMeeting.findMany({
        where: {groupId: groupId},
        orderBy: {startTime: "asc"}
    })

    for (let i = 0; i < meetings.length ; i++) {
        await prisma.groupMeeting.update({
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
        const overlapingMeetings = await prisma.groupMeeting.findFirst({
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

        await prisma.groupMeeting.update({
            where: { id: data.meetingId },
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                price: data.price,
                street: data.street,
                cityId: data.cityId
            }
        })

        await sortMeetings(meeting.groupId)

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

export const RegisterToMeeting = async (data: z.infer<typeof RegisterToMeetingSchema>) => {
    let group

    try {
        group = await prisma.group.findUnique({
            where: {
                id: data.groupId
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                }
            }
        })
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych.");
    }

    if (!group) throw new Error("Nie znaleziono grupy.")    
    if (group._count.members >= group.maxMembers) throw new Error("Brak wolnych miejsc w tej grupie.");
    
    let user

    try {
        user = await prisma.user.findUnique({
            where: { email: data.email}
        })
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych.");
    }

    if (!user) {
        try {
            user = await prisma.user.create({ data })
        } catch (error) {
            throw new Error("Rejestracja nie powiodła się. Spróbuj ponownie.")
        }

        try {
            const verificationToken = await GenerateVerificationToken(data.email)
            await sendVerificationEmail(verificationToken)
        } catch (error) {
            throw new Error("Nie udało się wysłać e-maila weryfikacyjnego.")
        }
    }


}

export const GetMeetingById = async (id: string) => {
    try {
        return await prisma.groupMeeting.findUnique({ where: {id}})
    } catch (error) {
        return null
    }
}

export const sortMeetings = async (groupId: string) => {
    const meetings = await prisma.groupMeeting.findMany({
        where: {groupId: groupId},
        orderBy: { startTime: "asc"}
    })

    for (let i = 0; i < meetings.length; i++) {
        const meeting = meetings[i];
        await prisma.groupMeeting.update({
          where: { id: meeting.id },
          data: { number: i + 1 } // najstarszy = 1
        });
      }
}