"use server"

import { CreateMeetingSchema, RegisterToMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { GenerateVerificationToken, GetUserByID } from "./auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/nodemailer"
import { randomUUID } from "crypto"

export const CreateMeeting = async (data: z.infer<typeof CreateMeetingSchema>) => {
    const user = await GetUserByID()

    if (user.role !== Role.Admin && user.role !== Role.Moderator) throw new Error("Brak uprawnień do tworzenia spotkania")
    
    try {
        //const meetingCount = await RefreshMeetingsNumbering(data.groupId)

        //await prisma.groupMeeting.create({
        //    data: {
        //        groupId: data.groupId,
        //        startTime: data.startTime,
        //        street: data.street,
        //        cityid: randomUUID(),
        //        number: meetingCount + 1,
        //        price: data.price
        //    }
        //})
    } catch(error) {
        throw new Error("Błąd połączenia z bazą danych")
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