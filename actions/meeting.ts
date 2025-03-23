"use server"

import { CreateMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { GetUserByID } from "./auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const CreateMeeting = async (data: z.infer<typeof CreateMeetingSchema>) => {
    const user = await GetUserByID()

    if (user.role !== Role.Admin && user.role !== Role.Moderator) throw new Error("Brak uprawnień do tworzenia spotkania")
    
    try {
        const meetingCount = await RefreshMeetingsNumbering(data.id)

        await prisma.groupMeeting.create({
            data: {
                groupId: data.id,
                startTime: data.startTime,
                street: data.street,
                city: data.city,
                number: meetingCount + 1,
                price: data.price
            }
        })
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