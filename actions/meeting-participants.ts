"use server"

import { prisma } from "@/lib/prisma"
import { SendMemberToVacationSchema } from "@/schema/moderator"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { GetMeetingById } from "./meeting"
import { PermissionGate } from "@/utils/gate"
import { CircleMeeting, Role } from "@prisma/client"
import { GetUserByID } from "./user"
import { clientAuth } from "@/hooks/auth"

export const GetFutureMeetingsForUserInCircle = async (userID:string, circleID: string) => {
    return await prisma.circleMeetingParticipant.findMany({
        where: {
            userId: userID,
            meeting: {
                circleId: circleID,
                startTime: { gte: new Date() }
            },
        }, 
        include: { meeting: true }
    })
}

export const GetMeetingParticipationByID = async (ID: string) => {
    try {
        return await prisma.circleMeetingParticipant.findUnique({
            where: { id: ID }
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

export const GetMeetingParticipationWithMeetingAndUserByID = async (ID: string) => {
    try {
        return await prisma.circleMeetingParticipant.findUnique({
            where: { id: ID },
            include: {
                user: true,
                meeting: { include: { circle: true }}
            }
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

// export const SendMemberToVacation = async (data: z.infer<typeof SendMemberToVacationSchema>) => {
//     const moderator = await CheckLoginReturnUser()

//     if (!moderator) throw new Error ("Musisz być zalogowanym by wykonać tę operację")

//     const meeting = await GetMeetingById(data.meetingID)

//     if (!meeting) throw new Error ("Nie znaleziono informacji o podanym spotkaniu")

//     const member = await GetUserByID(data.memberID)

//     if (!member) throw new Error ("Nie znaleziono kręgowca")
    
//     if (moderator.id === member.id) {
//         // Scenariusz samoprzydzielenia urlopu
//         if (member.vacationDays <=0) throw new Error("Wykorzystałeś już wszystkie dni wolne")

//         try {
//             await prisma.
//         }
//     } else {
//         // Scenariusz przydzielenia urlopu przez moderatora lub admina
//         if (!moderator.roles.includes(Role.Admin) && !(moderator.roles.includes(Role.Moderator) && moderator.id === meeting.moderatorId)) {
//             throw new Error("Nie masz uprawnień, aby wysłać tego użytkownika na urlop");
//         }        
//     }
// }

export const GetMeetingParticipantsByMeetingID = async (meetingID: string) => {
    try {
        return await prisma.circleMeetingParticipant.findMany({
            where: {meetingId: meetingID},
            include: {
                user: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        email: true,
                    }
                },
            }
        })
    } catch (error) {
        console.log(error)
        return []
    }
}