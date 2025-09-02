import { z } from "zod"

const participationID = z.string().uuid()

export const SendParticipantToVacationSchema = z.object({
    participationID,
})
