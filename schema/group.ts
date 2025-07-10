import * as z from 'zod'

const name = z.string().min(1, "Grupa musi posiadać nazwę")
const maxMembers = z.number().min(1, "Grupa musi mieć przynajmniej jedną osobę")
const slug = z.string()
  .min(1, "Unikalny odnośnik nie może być pusty")
  //.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")
  .refine(
    (value) => /^[a-z0-9-]+$/.test(value),
    {
      message: "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki"
    }
  )
  .refine(
    (value) => !value.startsWith("-") && !value.endsWith("-"),
    {
      message: "Unikalny odnośnik nie może zaczynać się ani kończyć myślnikiem"
    }
  )

export const GroupSchema = z.object({
    name,
    maxMembers,
    slug
})