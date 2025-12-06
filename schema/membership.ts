import { z } from "zod"

const circleId = z.string().uuid()
const userId = z.string().uuid()
const membershipId = z.string().uuid()
const reason = z.string().max(500).optional().nullable()
const email = z.string().email({ message: "Podaj poprawny e-mail" }).transform((val) => val.toLowerCase());
const name = z.string().optional().nullable()

export const RemoveMembershipSchema = z.object({
    membershipId,
    reason
})

export const RestoreMembershipSchema = z.object({
    membershipId
})

export const AddMembershipByModeratorSchema = z.object({
    circleId,
    email,
    name
})