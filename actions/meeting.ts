"use server"

import { CreateMeetingSchema, RegisterToMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { CheckLoginReturnUser, GenerateVerificationToken, GetUserByID } from "./auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/nodemailer"
import { randomUUID } from "crypto"
import { GetGroupById } from "./group"
import { Result } from "postcss"
import { ActionStatus } from "@/types/enums"

export const CreateMeeting = async (data: z.infer<typeof CreateMeetingSchema>) => {    
    const user = await CheckLoginReturnUser()

    if (!user) return {
        status: ActionStatus.Error,
        message: "Musisz być zalogowanym by utworzyć spotkanie"
    }

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return {
        status: ActionStatus.Error,
        message: "Brak uprawnień do dodania spotkania"
    }

    const group = await GetGroupById(data.groupId)

    if (!group) return {
        status: ActionStatus.Error,
        message: "Dana grupa nie istnieje"
    }

    if (user.role === Role.Moderator && user.id !== group.moderatorId) return {
        status: ActionStatus.Error,
        message: "Brak uprawień do dodania spotkania"
    }

    try {
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
            status: ActionStatus.Error,
            message: "Błąd połączenia z bazą danych"
        }
    }

    return {
        status: ActionStatus.Success,
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