"use server"

import { prisma } from "@/lib/prisma"
import { CreateCircleSchema, EditCircleSchema } from "@/schema/circle"
import { TypeOf, object, string, z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { Role } from "@prisma/client"
import { ActionStatus } from "@/types/enums"
import { parse } from "path"
import { customAlphabet } from 'nanoid'
import { finalSlugify, liveSlugify } from "@/utils/slug"
import { PermissionGate } from "@/utils/gate"
import { setTimeout } from "timers"

export const CreateCircle = async (data: z.infer<typeof CreateCircleSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by utworzyć grupę"
    }

    if (!PermissionGate(user.roles, [Role.Moderator])) return {
        success: false,
        message: "Brak uprawnień do dodania grupy"
    }
 
    let counter = 1
    let slug = finalSlugify(data.name)
    
    while (true) {
        const exist = await GetCircleBySlug(slug)

        if (!exist) break

        slug = `${slug}-${counter}`
        counter++
    }

    try {
        await prisma.circle.create({
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

export const EditCircle = async (data: z.infer<typeof EditCircleSchema>) => {    
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym aby edytować grupę"
    }

    const circle = await GetCircleByID(data.circleId)

    if (!circle) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (!(user.roles.includes(Role.Admin) || (user.roles.includes(Role.Moderator) && user.id === circle.moderatorId))) return {
        success: false,
        message: "Brak uprawień do edycji grupy"
    }

    if (circle.slug !== data.slug) {
        const existingSlug = await GetCircleBySlug(data.slug)

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
                maxMembers: data.maxMembers,
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

const GetCircleBySlug = async (slug: string) => {
    try {
        return await prisma.circle.findUnique({where: {slug}})
    } catch (error) {
        console.error(error)
        return null
    }
}

export const GetCircleByID = async (id: string) => {
    return await prisma.circle.findUnique({ 
        where: {id},
        include: {
            moderator: { select: {
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