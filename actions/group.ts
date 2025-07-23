"use server"

import { prisma } from "@/lib/prisma"
import { CreateGroupSchema, EditGroupSchema } from "@/schema/group"
import { TypeOf, object, z } from "zod"
import { GetUserByID } from "./auth"
import { Role } from "@prisma/client"
import { ActionStatus } from "@/types/enums"
import { parse } from "path"
import { ValidationErrors, addError } from "@/utils/action"
import { customAlphabet } from 'nanoid'
import { finalSlugify, liveSlugify } from "@/utils/slug"

export const CreateGroup = async (data: z.infer<typeof CreateGroupSchema>) => {
    const user = await GetUserByID()

    if (user.role !== Role.Admin && user.role !== Role.Moderator) throw new Error("Brak uprawnień do tworzenia grupy")

    //const existingGroup = await GetGroupBySlug(data.slug)

    //if (existingGroup) return {
    //    success: false,
    //    field: "slug",
    //    message: "Dany odnośnik jest już zajęty"
    //}
    let counter = 1
    let slug = finalSlugify(data.name)
    
    while (true) {
        const exist = await prisma.group.findUnique({
            where: { slug }
        })

        if (!exist) break

        slug = `${slug}-${counter}`
        counter++
    }

    try {
        await prisma.group.create({
            data: {
                name: data.name,
                slug: slug,
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
    //console.log("DATA:", data)
    
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

    const errors: ValidationErrors = {}
    const parseResult = EditGroupSchema.safeParse(data)
        
    if (!parseResult.success) {
        const flattened = parseResult.error.flatten()
        
        Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
            messages.forEach(message => addError(errors, field, message))
        })
        
        flattened.formErrors.forEach(message => addError(errors, "root", message))
    }
    //console.log(data.slug)
    //console.log(errors)

            
    if (data.slug && !errors["slug"] && data.slug !== group.slug) {
        const existingSlug = await prisma.group.findUnique({
            where: {slug: data.slug}
        })

        if (existingSlug && existingSlug.id !== group.id) {
            addError(errors, "slug", "Podany odnośnik jest już zajęty")
        }
    }

    const dataToUpdate = Object.fromEntries(
        Object.entries(data).filter(([key, value]) =>
            !errors[key] && value !== group[key as keyof typeof group]
        )
    )

    // Jeśli nie ma co aktualizować:
    if (Object.keys(dataToUpdate).length === 0) {
        return {
            status: Object.keys(errors).length === 0 ? ActionStatus.Error : ActionStatus.Partial,
            message: Object.keys(errors).length === 0
                ? "Nie udało się zaktualizować danych"
                : "Niektórych danych nie udało się zaktualizować",
            errors
        }
    }

    //console.log(dataToUpdate)

    try {
        await prisma.group.update({
            where: {id: groupId},
            data: dataToUpdate
        })

        return {
            status: Object.keys(errors).length === 0 ? ActionStatus.Success : ActionStatus.Partial,
            message: Object.keys(errors).length === 0
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