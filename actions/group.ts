"use server"

import { prisma } from "@/lib/prisma"
import { GroupSchema } from "@/schema/group"
import { z } from "zod"
import { GetUserByID } from "./auth"
import { Role } from "@prisma/client"

export const CreateGroup = async (data: z.infer<typeof GroupSchema>) => {
    const user = await GetUserByID()

    if (user.role !== Role.Admin && user.role !== Role.Moderator) throw new Error("Brak uprawnień do tworzenia grupy")

    const existingGroup = await GetGroupBySlug(data.slug)

    //if (existingGroup) throw new Error("Dany odnośnik jest już zajęty")
    if (existingGroup) throw {
        field: "slug",
        message: "Dany odnośnik jest już zajęty"
    }


    try {
        await prisma.group.create({
            data: {
                name: data.name,
                moderatorId: user.id,
                maxMembers: data.maxMembers,
                slug: data.slug
            }
        })
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}

const GetGroupBySlug = async (slug: string) => {
    try {
        return await prisma.group.findUnique({where: {slug}})
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}