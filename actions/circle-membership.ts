"use server"

import { prisma } from "@/lib/prisma"
import { CircleMembershipStatus } from "@prisma/client"

export const GetActiveCircleMembersByCircleID = async (circleID: string) => {
    try {
        return await prisma.circleMembership.findMany({
            where: {
                circleId: circleID,
                status: CircleMembershipStatus.Active
            },
            include: {
                user: true
            }
        })
    } catch {
        return null
    }
}

export const GetCricleMembershipByUserAndCirlceIDs = async (userID: string, circleID:string) => {
    try {
        return await prisma.circleMembership.findUnique({
            where: {
                userId_circleId: {
                    userId: userID,
                    circleId: circleID
                }
            }
        })
    } catch (error) {
        console.error(error)
        return null
    }
}