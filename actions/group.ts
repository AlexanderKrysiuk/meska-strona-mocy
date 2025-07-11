"use server"

import { prisma } from "@/lib/prisma"
import { CreateGroupSchema } from "@/schema/group"
import { ZodError, ZodIssueCode, z } from "zod"
import { GetUserByID } from "./auth"
import { Role } from "@prisma/client"

export const CreateGroup = async (data: z.infer<typeof CreateGroupSchema>) => {
    const user = await GetUserByID()

    if (user.role !== Role.Admin && user.role !== Role.Moderator) throw new Error("Brak uprawnień do tworzenia grupy")

    //const existingGroup = await GetGroupBySlug(data.slug)

    //if (existingGroup) return {
    //    success: false,
    //    field: "slug",
    //    message: "Dany odnośnik jest już zajęty"
    //}

    try {
        await prisma.group.create({
            data: {
                name: data.name,
                moderatorId: user.id,
                maxMembers: data.maxMembers
            }
        })
    } catch (error) {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    return {
        success: true,
        message: "Pomyślnie dodano nową grupę"
    }
}

const GetGroupBySlug = async (slug: string) => {
    try {
        return await prisma.group.findUnique({where: {slug}})
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}