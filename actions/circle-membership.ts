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