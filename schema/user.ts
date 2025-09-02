import * as z from 'zod'

const circleId = z.string().uuid()
const userId = z.string().uuid()
const membershipId = z.string().uuid()
const reason = z.string().max(500).optional().nullable()
const name = z.string().optional().nullable()
const email = z.string().email({ message: "Podaj poprawny e-mail" }).transform((val) => val.toLowerCase());
const newPassword = z.string()
.min(8, "Hasło musi mieć co najmniej 8 znaków" )
.regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę" )
.regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę" )
.regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę" )
.regex(/[\W_]/, "Hasło musi zawierać co najmniej jeden znak specjalny" )
const confirmPassword = z.string()
const password = z.string().min(1)

export const RegisterSchema = z.object({
    name,
    email
})

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



export const RestoreUserToCircleSchema = z.object({
    userId,
    circleId
})