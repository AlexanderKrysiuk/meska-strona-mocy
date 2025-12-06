"use server"

import { prisma } from "@/lib/prisma"

export const GetCountries = async () => {
    try {
        return await prisma.country.findMany()
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}