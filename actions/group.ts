"use server"

import { prisma } from "@/lib/prisma"
import { CreateGroupSchema, EditGroupSchema } from "@/schema/group"
import { TypeOf, z } from "zod"
import { GetUserByID } from "./auth"
import { Role } from "@prisma/client"
import { ActionStatus } from "@/types/enums"

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
    const user = await GetUserByID()
    const group = await prisma.group.findUnique({
        where: {id: groupId}
    })

    if (!group) return {
        status: ActionStatus.Error,
        message: "Nie znaleziono grupy"
    }

    if (user.role !== Role.Admin && user.role !== Role.Moderator && user.id !== group.moderatorId) return {
        status: ActionStatus.Error,
        message: "Brak uprawnień do edycji grupy"
    }

    const errors: { field: keyof typeof data; message: string }[] = []
    const dataToUpdate: Partial<typeof data> = {}

    if (data.name && data.name !== group.name) {
        dataToUpdate.name = data.name
    }

    if (data.slug && data.slug !== group.slug) {
        const existingSlug = await prisma.group.findUnique({
            where: {slug: data.slug}
        })
        
        if (existingSlug) {
            errors.push({
                field: "slug",
                message: "Podany odnośnik jest już zajęty"
            })
        } else {
            dataToUpdate.slug = data.slug
        }

    }

    // Jeśli nie ma co aktualizować:
    if (Object.keys(dataToUpdate).length === 0) {
        return {
            status: errors.length === 0 ? ActionStatus.Error : ActionStatus.Partial,
            message: errors.length === 0
                ? "Brak zmian do zapisania"
                : "Niektórych danych nie udało się zaktualizować",
            errors
    }
  }

    try {
        await prisma.group.update({
            where: {id: groupId},
            data
        })

        return {
            status: errors.length === 0 ? ActionStatus.Success : ActionStatus.Partial,
            message: errors.length === 0
              ? "Pomyślnie zaktualizowano dane"
              : "Niektórych danych nie udało się zaktualizować",
            errors
        }
    } catch {
        return {
            status: ActionStatus.Error,
            message: "Błąd połączenia z bazą danych"
        }
    }
}


const GetGroupBySlug = async (slug: string) => {
    try {
        return await prisma.group.findUnique({where: {slug}})
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}