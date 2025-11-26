import { Role } from '@prisma/client'
import * as z from 'zod'
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const phone = z.string().refine((val) => {
    const phone = parsePhoneNumberFromString(val);
    if (!phone) return false; // niepoprawny format
    return phone.isValid(); // sprawdza prefix i długość
}, {
    message: "Podaj poprawny numer telefonu z prefiksem",
});

const circleId = z.string().uuid()
const userId = z.string().uuid()
const membershipId = z.string().uuid()
const reason = z.string().max(500).optional().nullable()
const name = z.string()
const email = z.string().email({ message: "Podaj poprawny e-mail" }).transform((val) => val.toLowerCase());
const newPassword = z.string()
.min(8, "Hasło musi mieć co najmniej 8 znaków" )
.regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę" )
.regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę" )
.regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę" )
.regex(/[\W_]/, "Hasło musi zawierać co najmniej jeden znak specjalny" )
const confirmPassword = z.string()
const password = z.string().min(1)
const description = z.string().nullable()
const slug = z.string()
    .min(1, "Unikalny odnośnik nie może być pusty")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unikalny odnośnik może zawierać tylko małe litery, cyfry i myślniki")
    .nullable()   
 
export const RegisterSchema = z.object({
    name,
    email,
    phone
})

export const RegisterToCircle = z.object({
    name,
    email,
    circleId,
    phone,
});  

export const LoginSchema = z.object({
    email,
    password
})

export const NewPasswordSchema = z.object({
    newPassword,
    confirmPassword
}).refine((data)=> data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Hasła muszą być takie same"
})

export const ResetPasswordSchema = z.object({
    email
})

export const AddUserToCircleSchema = RegisterSchema.extend({
    circleId
})

export const EditUserSchema = z.object({
    name,
    description,
    slug,
})