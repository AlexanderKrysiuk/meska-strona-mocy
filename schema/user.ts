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
        if (!val) return true; // opcjonalne
        const phoneNumber = parsePhoneNumberFromString(val);
        return phoneNumber?.isValid() ?? false;
    }, "Podaj prawidłowy numer telefonu");

export const RegisterSchema = z.object({
    name: name.optional(),
    email,
    phone: phone.optional()
})