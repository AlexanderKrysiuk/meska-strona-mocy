"use server"

import { prisma } from "@/lib/prisma"

export const GetRegions = async () => {
    try {
        return await prisma.region.findMany()
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}