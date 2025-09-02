import { z } from "zod"

const membershipId = z.string().uuid()
const reason = z.string().max(500).optional().nullable()

export const DeleteMemberFromCircleSchema = z.object({
    membershipId,
    reason
})