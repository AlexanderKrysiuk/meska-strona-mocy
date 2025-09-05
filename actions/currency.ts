"use server"

import { prisma } from "@/lib/prisma"

export const GetCurrencies = async () => {
    try {
        return await prisma.currency.findMany()
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}