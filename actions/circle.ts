"use server"

import { prisma } from "@/lib/prisma"
import { CreateCircleSchema, EditCircleSchema } from "@/schema/circle"
import { TypeOf, object, string, z } from "zod"
import { CheckLoginReturnUser, GetUserByID } from "./auth"
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

    if (!PermissionGate(user.roles, [Role.Moderator])) return {
        success: false,
        message: "Brak uprawień do edycji grupy"
    }

    const circle = await GetCircleById(data.circleId)

    if (!circle) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (PermissionGate(user.roles, [Role.Moderator]) && user.id !== circle.moderatorId) return {
        success: false,
        message: "Brak uprawnień do edycji grupy"
    }

    if (circle.slug !== data.slug) {
        const existingSlug = await GetCircleBySlug(data.slug)

        if (existingSlug) return {
            success: false,
            message: "Nie udało się zaktualizować grupy",
            errors: {
                slug: ["Podany odnośnik jest już zajęty"]
            }
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
                price: data.price
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
    // const parseResult = EditCircleSchema.safeParse(data)
        
    // if (!parseResult.success) {
    //     const flattened = parseResult.error.flatten()
        
    //     Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
    //         messages.forEach(message => addError(errors, field, message))
    //     })
        
    //     flattened.formErrors.forEach(message => addError(errors, "root", message))
    // }
    // //console.log(data.slug)
    // //console.log(errors)

            
    // if (data.slug && !errors["slug"] && data.slug !== circle.slug) {
    //     const existingSlug = await prisma.circle.findUnique({
    //         where: {slug: data.slug}
    //     })

    //     if (existingSlug && existingSlug.id !== circle.id) {
    //         addError(errors, "slug", "Podany odnośnik jest już zajęty")
    //     }
    // }

//     const dataToUpdate = Object.fromEntries(
//         Object.entries(data).filter(([key, value]) =>
//             !errors[key] && value !== circle[key as keyof typeof circle]
//         )
//     )

//     // Jeśli nie ma co aktualizować:
//     if (Object.keys(dataToUpdate).length === 0) {
//         return {
//             status: Object.keys(errors).length === 0 ? ActionStatus.Error : ActionStatus.Partial,
//             message: Object.keys(errors).length === 0
//                 ? "Nie udało się zaktualizować danych"
//                 : "Niektórych danych nie udało się zaktualizować",
//             errors
//         }
//     }

//     //console.log(dataToUpdate)

//     try {
//         await prisma.circle.update({
//             where: {id: circleId},
//             data: dataToUpdate
//         })

//         return {
//             status: Object.keys(errors).length === 0 ? ActionStatus.Success : ActionStatus.Partial,
//             message: Object.keys(errors).length === 0
//               ? "Pomyślnie zaktualizowano dane"
//               : "Niektórych danych nie udało się zaktualizować",
//             errors
//         }
//     } catch {
//         return {
//             status: ActionStatus.Error,
//             message: "Błąd połączenia z bazą danych"
//         }
//     }
}

const GetCircleBySlug = async (slug: string) => {
    try {
        return await prisma.circle.findUnique({where: {slug}})
    } catch (error) {
        return null
    }
}

export const GetCircleById = async (id: string) => {
    try {
        return await prisma.circle.findUnique({ where: {id}})
    } catch(error) {
        console.error("Błąd podczas pobierania grupy:", error)
        return null
    }
}

export const GetCircleMembershipById = async (id:string) => {
    try {
        return await prisma.circleMembership.findUnique({ where: { id: id }})
    } catch {
        return null
    }
}

export const GetModeratorCircles = async (moderatorID:string) => {
    try {
        setTimeout(()=>{},5000)
        return await prisma.circle.findMany({
            where: {moderatorId: moderatorID}
        })
    } catch (error) {
        console.error(error)
        throw new Error ("Błąd połączenia z bazą danych")
    }
}