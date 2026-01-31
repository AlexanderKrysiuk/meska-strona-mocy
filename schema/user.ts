import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js";


const name = z
    .string()
    .trim()
    .refine((val) => val.split(/\s+/).length >= 2, "Podaj imię i nazwisko")
const email = z
    .string()
    .email("Podaj prawidłowy adres email")
const phone = z
  .string()
  .refine((val) => {
    const phoneNumber = parsePhoneNumberFromString(val);
    return phoneNumber?.isValid() ?? false;
  }, "Podaj prawidłowy numer telefonu");

const password = z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[a-z]/, "Hasło musi zawierać małą literę")
    .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać cyfrę")

//const password = z
//    .string()

export const RegisterSchema = z.object({
    name,
    email,
    password,
    phone
})

// const confirmPassword = z.object({
//     newPassword,
//     password
// }).refine(
//     (data) => data.newPassword === data.password,
//     {
//       message: "Hasła muszą być identyczne",
//       path: ["newPassword"],
//     }
// )

// export const VerifySchema = z.object({
//     email,
//     newPassword,
//     password
// }).refine(
//     (data) => data.newPassword === data.password,
//     {
//       message: "Hasła muszą być identyczne",
//       path: ["newPassword"],
//     }
// )

export const LoginSchema = z.object({
    email,
    password
})