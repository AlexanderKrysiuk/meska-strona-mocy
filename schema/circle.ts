import { Currency, WeekDay } from '@prisma/client'
import * as z from 'zod'

const circleId = z.string().uuid()

const name = z.string({
  required_error: "Pole nie może być puste",
}).min(1, "Krąg musi posiadać nazwę")

const slug = z.string({
  required_error: "Pole nie może być puste",
}).min(1, "Unikalny odnośnik nie może być pusty")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")

const members = z.object({
  min: z.number({
    required_error: "Pole nie może być puste",
    invalid_type_error: "Pole nie może być puste",
  }).int().min(1, "Minimalna liczba uczestników musi być większa od zera"),
  max: z.number({
    required_error: "Pole nie może być puste",
    invalid_type_error: "Pole nie może być puste",
  }).int().min(1, "Maksymalna liczba uczestników musi być większa od zera")
}).refine((members) => members.max >= members.min,{
  message: "Maksymalna liczba uczestników musi być większa lub równa minimalnej",
  path: ["max"]
}) 

const plannedWeekday = z.nativeEnum(WeekDay).nullable();

const frequencyWeeks = z.number()
  .int()
  .min(1, "Cykliczność musi wynosić minimum 1 tydzień")
  .max(4, "Maksymalna cykliczność to 4 tygodnie") // możesz zmienić
  .nullable();

const hourString = z.string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Niepoprawny format godziny (HH:mm)")

// const hours = z.object({
//   start: hourString,
//   end: hourString,
// }).refine(data => {
//   const [sh, sm] = data.start.split(":").map(Number);
//   const [eh, em] = data.end.split(":").map(Number);
//   return eh * 60 + em > sh * 60 + sm;
// }, {
//   message: "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia",
//   path: ["end"]
// });

export const hours = z.object({
  start: hourString,
  end: hourString,
}).superRefine((data, ctx) => {
  const [sh, sm] = data.start.split(":").map(Number);
  const [eh, em] = data.end.split(":").map(Number);

  if (eh * 60 + em <= sh * 60 + sm) {
    ctx.addIssue({
      code: "custom",
      message: "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia",
      path: ["end"],
    });
  }
  if (sh * 60 + sm >= eh * 60 + em) {
    ctx.addIssue({
      code: "custom",
      message: "Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia",
      path: ["start"],
    });
  }
});
  

const street = z.string()
  .min(3, "Nazwa ulicy musi mieć co najmniej 3 znaki")
  .max(255, "Adres jest zbyt długi")
  .trim()
  .nullable()

const cityId = z.string().uuid().nullable()

const isOnline = z.boolean()


// const price = z.preprocess(
//   (val) => {
//     if (val === "" || val === undefined || val === null) return null; // brak ceny = null
//     const num = Number(val);
//     return isNaN(num) ? null : num;
//   },
//   z.number(
//     {invalid_type_error: "Pole nie może być puste"}
//   )
//     .int("Cena musi być liczbą całkowitą")
//     .min(10, "Cena musi wynosić minimum 10 zł")
// );

const price = z.number({ invalid_type_error: "Pole nie może być puste" })
  .int("Cena musi być liczbą całkowitą")
  .min(10, "Cena musi wynosić minimum 10 zł")

const newUserPrice = z.number({ invalid_type_error: "Pole nie może być puste" })
  .int("Cena musi być liczbą całkowitą")
  .refine(val => val === 0 || val >= 10, {
    message: "Cena pierwszego spotkania musi wynosić 0 lub minimum 10 zł"
  })

const currency = z.nativeEnum(Currency)

const isPublic = z.boolean()

const timeZone = z.string().nullable()

// const price = z.number().nullable()
//   .refine((val) => val === null || val === 0 || val >= 10, {
//     message: "Cena musi wynosić 0 (darmowe spotkanie) lub minimum 10 zł"
//   })    

export const CreateCircleSchema = z.object({
  name,
  slug,
  street,
  cityId,

  members,
  price,
  newUserPrice,

  currency,
  isPublic,
  isOnline,

  plannedWeekday,
  frequencyWeeks,

  hours,
  timeZone
})

// EDIT
export const EditCircleSchema = CreateCircleSchema.extend({
  circleId,
});