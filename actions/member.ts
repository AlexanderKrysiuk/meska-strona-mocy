"use server"

import { SendMemberToVacationSchema } from "@/schema/moderator"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { prisma } from "@/lib/prisma"

export const SendMemberToVacation = async (data: z.infer<typeof SendMemberToVacationSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }

    const dane = await prisma.circleMeetingParticipant.findUnique({
        where: {id: data.participationID},
        include: {
            meeting: {
                include: {
                    circle: true
                }
            }
        }
    })
}

export const GetCircleMembersByCircleID = async (ID:string) => {
    try {
        return await prisma.circleMembership.findMany({
            where: {circleId: ID},
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        email: true,
                    }
                },
                circle: {
                    select: {
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

export const GetMemberWithMeetingAndCircleByParticipationID = async (ID:string) => {
    
}