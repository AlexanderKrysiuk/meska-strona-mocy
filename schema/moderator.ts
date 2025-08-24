import * as z from 'zod'

const participationID = z.string().uuid()

export const SendMemberToVacationSchema = z.object({
    participationID,
})

export const ReturnMemberFromVacationSchema = z.object({
    participationID
})