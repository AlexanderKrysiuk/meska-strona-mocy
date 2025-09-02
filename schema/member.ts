import { z } from "zod"

const circleId = z.string().uuid()
const userId = z.string().uuid()
const membershipId = z.string().uuid()
const reason = z.string().max(500).optional().nullable()

export const DeleteMemberFromCircleSchema = z.object({
    membershipId,
    reason
})

export const RestoreMemberToCircleSchema = z.object({
    membershipId
})