import * as z from 'zod'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const name = z.string().min(1, "Grupa musi posiadać nazwę")


const maxMembers = z.number({
  required_error: "Pole nie może być puste",
  invalid_type_error: "Pole nie moze być puste"
  })
  .min(1, "Grupa musi mieć przynajmniej jedną osobę")

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
const street = z.string().trim().max(255, "Adres jest zbyt długi").nullable()

const cityId = z.string().uuid().nullable()

// const price = z.union([
//   z.number().refine(val => val === 0 || val >= 10, {
//     message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
//   }),
//   z.null()
// ]).optional()

// const price = z.number()
//   .transform((val) => (isNaN(val) ? null : val))
//   .refine((val) => val === 0 || val >= 10, {
//     message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
//   })
//   .nullable()

// const price = z.preprocess(
//   (val) => {
//     if (typeof val === "number") {
//       return isNaN(val) ? null : val;
//     }
//     if (typeof val === "string") {
//       const num = Number(val);
//       return isNaN(num) ? null : num;
//     }
//     return val;
//   },
//   z
//     .number()
//     .nullable()
//     .refine((val) => val === null || val === 0 || val >= 10, {
//       message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
//     })
// );

const price = z.number()
  .nullable()
  .refine((val) => val === null || val === 0 || val >= 10, {
    message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
  })    

export const CreateGroupSchema = z.object({
    name,
    maxMembers,
})

export const EditGroupSchema = z.object({
  name,
  slug,
  maxMembers,
  street,
  cityId,
  price
})

export const EditGroupSlugSchema = z.object({
  slug
})