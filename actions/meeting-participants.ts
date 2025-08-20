"use server"

import { prisma } from "@/lib/prisma"

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