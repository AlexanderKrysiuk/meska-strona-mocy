"use server"

import { prisma } from "@/lib/prisma"

export const GetFullLocalizationByCityID = async (ID: string) => {
    try {
        return await prisma.city.findUnique({
            where: {id: ID},
            include: { region: { include: { country: true }}}
        })
    } catch (error) {
        console.error(error)
        return null
    }
}