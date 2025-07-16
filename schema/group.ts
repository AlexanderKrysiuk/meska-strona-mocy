import * as z from 'zod'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const name = z.string().min(1, "Grupa musi posiadać nazwę")
const maxMembers = z.number().min(1, "Grupa musi mieć przynajmniej jedną osobę")
const slug = z.string()
  .min(1, "Unikalny odnośnik nie może być pusty")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")
  .refine((val) => !uuidRegex.test(val), {
    message: "Slug nie może wyglądać jak identyfikator systemowy (UUID)"
  })

  //.refine(
  //  (value) => /^[a-z0-9-]+$/.test(value),
  //  {
  //    message: "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki"
  //  }
  //)
  //.refine(
  //  (value) => !value.startsWith("-") && !value.endsWith("-"),
  //  {
  //    message: "Unikalny odnośnik nie może zaczynać się ani kończyć myślnikiem"
  //  }
  //)
const street = z.string().trim().max(255, "Adres jest zbyt długi").optional()
const cityId = z.string().uuid().optional()

export const CreateGroupSchema = z.object({
    name,
    maxMembers,
})

export const EditGroupSchema = z.object({
  name,
  slug,
  maxMembers,
  street,
  cityId
})

export const EditGroupSlugSchema = z.object({
  slug
})