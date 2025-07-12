"use server"

import { prisma } from "@/lib/prisma"
import { CreateGroupSchema, EditGroupSchema } from "@/schema/group"
import { z } from "zod"
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

export const EditGroup = async (groupId: string, data: z.infer<typeof EditGroupSchema>) => {
    console.log("PASS")
    const user = await GetUserByID()
    const group = await prisma.group.findUnique({
        where: {id: groupId}
    })

    if (!group) return {
        success: false,
        message: "Nie znaleziono grupy"
    }

    if (user.role !== Role.Admin && user.role !== Role.Moderator && user.id !== group.moderatorId) return {
        success: false,
        message: "Brak uprawnień do edycji grupy"
    }

    try {
        await prisma.group.update({
            where: {id: groupId},
            data
        })
    } catch {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    return {
        success: true,
        message: "Pomyślnie zaktualizowano dane"
    }
}


const GetGroupBySlug = async (slug: string) => {
    try {
        return await prisma.group.findUnique({where: {slug}})
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}