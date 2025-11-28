"use server"

import { prisma } from "@/lib/prisma"

export const GetTimeZones = async () => {
    try {
        return await prisma.timeZone.findMany()
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}