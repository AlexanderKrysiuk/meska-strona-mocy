"use server"

import { prisma } from "@/lib/prisma"
import { CreateCircleSchema, EditCircleSchema } from "@/schema/circle"
import { TypeOf, object, string, z } from "zod"
import { CheckLoginReturnUser, ServerAuth } from "./auth"
import { Role } from "@prisma/client"
import { ActionStatus } from "@/types/enums"
import { parse } from "path"
import { customAlphabet } from 'nanoid'
import { finalSlugify, liveSlugify } from "@/utils/slug"
import { PermissionGate } from "@/utils/gate"
import { setTimeout } from "timers"

export const CreateCircle = async (data: z.infer<typeof CreateCircleSchema>) => {
    const auth = await ServerAuth()

    if (!auth) return {
        success: false,
        message: "Musisz być zalogowanym by utworzyć grupę"
    }

    if (!auth.roles.includes(Role.Moderator) && !auth.roles.includes(Role.Admin)) return {
        success: false,
        message: "Brak uprawnień do dodania grupy"
    }
 
    let counter = 1
    let slug = finalSlugify(data.name)
    
    while (true) {
        const exist = await GetCircleBySlugAndModeratorID(slug, auth.id)

        if (!exist) break

        slug = `${slug}-${counter}`
        counter++
    }

    try {
        await prisma.circle.create({
            data: {
                name: data.name,
                slug: slug,
                moderatorId: auth.id
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

export const EditCircle = async (data: z.infer<typeof EditCircleSchema>) => {    
    const auth = await ServerAuth()

    if (!auth) return {
        success: false,
        message: "Musisz być zalogowanym aby edytować grupę"
    }

    const circle = await GetCircleByID(data.circleId)

    if (!circle) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (!(auth.roles.includes(Role.Admin) || (auth.roles.includes(Role.Moderator) && auth.id === circle.moderatorId))) return {
        success: false,
        message: "Brak uprawień do edycji grupy"
    }

    if (circle.slug !== data.slug) {
        const existingSlug = await GetCircleBySlugAndModeratorID(data.slug, circle.moderatorId)

        if (existingSlug) return {
            success: false,
            message: "Nie udało się zaktualizować grupy",
            fieldErrors: { slug: "Podany odnośnik jest już zajęty"}
        }
    }

    try {
        await prisma.circle.update({
            where: { id: data.circleId },
            data: {
                name: data.name,
                slug: data.slug,
                maxMembers: data.members.max,
                minMembers: data.members.min,
                street: data.street,
                cityId: data.cityId,
                price: data.price,
                currency: data.currency
            }
        })
    } catch {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }
    
    return {
        success: true,
        message: "Pomyślnie zaktualizowano grupę"
    }
}

const GetCircleBySlugAndModeratorID = async (slug: string, moderatorId: string) => {
    return await prisma.circle.findFirst({
        where: {
            slug: slug,
            moderatorId: moderatorId
        }
    })
}

export const GetCircleByID = async (id: string) => {
    return await prisma.circle.findUnique({ 
        where: {id},
        select: {
            id: true,
            name: true,
            moderator: { select: {
                id: true,
                name: true,
                image: true,
                title: true,
            }}
        }
    })
}

export const GetModeratorCircles = async (moderatorID:string) => {
    return await prisma.circle.findMany({
        where: {moderatorId: moderatorID}
    })
}