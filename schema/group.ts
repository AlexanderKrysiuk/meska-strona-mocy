import * as z from 'zod'

const name = z.string().min(1, "Grupa musi posiadać nazwę")
const maxMembers = z.number().min(1, "Grupa musi mieć przynajmniej jedną osobę")
const slug = z.string()
  .min(1, "Unikalny odnośnik nie może być pusty")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")

export const GroupSchema = z.object({
    name,
    maxMembers,
    slug
})