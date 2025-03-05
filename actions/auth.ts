"use server"

import { sendVerificationEmail } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schema/user";
import { z } from "zod";

export async function RegisterNewUser(data: z.infer<typeof RegisterSchema>) {
    let existingUser;

    try {
        existingUser = await prisma.user.findUnique({ 
            where: { email: data.email }
        });
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych.");
    }

    if (existingUser) throw new Error("Wprowadzono nieprawidłowe dane.");

    try {
        await prisma.user.create({ data })
    } catch (error) {
        throw new Error("Rejestracja nie powiodła się. Spróbuj ponownie.")
    }

    try {
        const verificationToken = await GenerateVerificationToken(data.email)
        await sendVerificationEmail(verificationToken)
    } catch (error) {
        throw new Error("Nie udało się wysłać e-maila weryfikacyjnego.")
    }
}

export async function GenerateVerificationToken(email:string) {
    const expires = new Date(new Date().getTime() + 3600*100)
    return await prisma.verificationToken.create({
        data: { email, expires }
    })
}