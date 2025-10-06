import { z } from "zod"

const participationID = z.string().uuid()

export const SendParticipantToVacationSchema = z.object({
    participationID,
})

export const ReturnParticipantFromVacationSchema = z.object({
    participationID
})