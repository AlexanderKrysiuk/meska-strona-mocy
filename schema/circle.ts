import { Currency } from '@prisma/client'
import * as z from 'zod'

//const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const circleId = z.string().uuid()
const name = z.string({
  required_error: "Pole nie może być puste",
  invalid_type_error: "Pole nie moze być puste"
  }).min(1, "Grupa musi posiadać nazwę")
const maxMembers = z.number({
  required_error: "Pole nie może być puste",
  invalid_type_error: "Pole nie moze być puste"
  })
  .min(1, "Grupa musi mieć przynajmniej jedną osobę")
const slug = z.string({
  required_error: "Pole nie może być puste",
  invalid_type_error: "Pole nie moze być puste"
  })
  .min(1, "Unikalny odnośnik nie może być pusty")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")
  // .refine((val) => !uuidRegex.test(val), {
  //   message: "Slug nie może wyglądać jak identyfikator systemowy (UUID)"
  // })
const street = z.string().min(3, "Nazwa ulicy musi mieć co najmniej 3 znaki").trim().max(255, "Adres jest zbyt długi")
const cityId = z.string().uuid().nullable()

const price = z.preprocess(
  (val) => {
    const num = Number(val);
    return isNaN(num) ? null : num; // zamień NaN na null
  },
  z.number().nullable().refine(
    (val) => val === null || val === 0 || val >= 10,
    {
      message:
        "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł",
    }
  )
);

const currency = z.nativeEnum(Currency).optional().nullable()
// const price = z.number().nullable()
//   .refine((val) => val === null || val === 0 || val >= 10, {
//     message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
//   })    

export const CreateCircleSchema = z.object({
  name,
  maxMembers,
})

export const EditCircleSchema = z.object({
  circleId,
  name,
  slug,
  maxMembers,
  street: street.nullable(),
  cityId,
  price: price.nullable(),
  currency
})

export const EditCircleSlugSchema = z.object({
  slug
})