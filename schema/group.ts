import * as z from 'zod'

const name = z.string().min(1, "Grupa musi posiadać nazwę")
const maxMembers = z.number().min(1, "Grupa musi mieć przynajmniej jedną osobę")

export const CreateGroupSchema = z.object({
    name,
    maxMembers
})