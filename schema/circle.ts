import { Currency } from '@prisma/client'
import * as z from 'zod'

//const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const circleId = z.string().uuid()
const name = z.string({
  required_error: "Pole nie może być puste",
  invalid_type_error: "Pole nie moze być puste"
  }).min(1, "Krąg musi posiadać nazwę")

const members = z.object({
  min: z.number()
    .int()
    .min(1, "Minimalna liczba uczestników musi być większa od zera"),

  max: z.number()
    .int()
    .min(1, "Maksymalna liczba uczestników musi być większa od zera")
}).refine((members) => members.max >= members.min,{
  message: "Maksymalna liczba uczestników musi być większa lub równa minimalnej",
  path: ["max"]
}) 

const slug = z.string({
  required_error: "Pole nie może być puste",
  invalid_type_error: "Pole nie moze być puste"
  })
  .min(1, "Unikalny odnośnik nie może być pusty")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")
  // .refine((val) => !uuidRegex.test(val), {
  //   message: "Slug nie może wyglądać jak identyfikator systemowy (UUID)"
  // })
const street = z
  .string()
  .min(3, "Nazwa ulicy musi mieć co najmniej 3 znaki")
  .trim()
  .max(255, "Adres jest zbyt długi")
  .nullable()

const cityId = z
  .string()
  .uuid()
  .nullable()

const price = z.preprocess(
  (val) => {
    if (val === "" || val === undefined || val === null) return null; // brak ceny = null
    const num = Number(val);
    return isNaN(num) ? null : num;
  },
  z.number()
    .int("Cena musi być liczbą całkowitą")
    .min(10, "Cena musi wynosić minimum 10 zł")
    .nullable()
);

const currency = z
  .nativeEnum(Currency)
  .nullable()

const isPublic = z.boolean()
// const price = z.number().nullable()
//   .refine((val) => val === null || val === 0 || val >= 10, {
//     message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
//   })    

export const CreateCircleSchema = z.object({
  name,
})

export const EditCircleSchema = z.object({
  circleId,
  name,
  slug,
  members,
  street,
  cityId,
  isPublic,
  price,
  newUserPrice: price,
  currency,
})