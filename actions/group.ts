"use server"

import { prisma } from "@/lib/prisma"
import { CreateGroupSchema, EditGroupSchema } from "@/schema/group"
import { TypeOf, object, string, z } from "zod"
import { CheckLoginReturnUser, GetUserByID } from "./auth"
import { Role } from "@prisma/client"
import { ActionStatus } from "@/types/enums"
import { parse } from "path"
import { customAlphabet } from 'nanoid'
import { finalSlugify, liveSlugify } from "@/utils/slug"

export const CreateGroup = async (data: z.infer<typeof CreateGroupSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by utworzyć grupę"
    }

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return {
        status: ActionStatus.Error,
        message: "Brak uprawnień do dodania grupy"
    }
 
    let counter = 1
    let slug = finalSlugify(data.name)
    
    while (true) {
        const exist = await GetGroupBySlug(slug)

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

export const EditGroup = async (data: z.infer<typeof EditGroupSchema>) => {    
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym aby edytować grupę"
    }

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return {
        success: false,
        message: "Brak uprawień do edycji grupy"
    }

    const group = await GetGroupById(data.groupId)

    if (!group) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (user.role === Role.Moderator && user.id !== group.moderatorId) return {
        success: false,
        message: "Brak uprawnień do edycji grupy"
    }

    if (group.slug !== data.slug) {
        const existingSlug = await GetGroupBySlug(data.slug)

        if (existingSlug) return {
            success: false,
            message: "Nie udało się zaktualizować grupy",
            errors: {
                slug: ["Podany odnośnik jest już zajęty"]
            }
        }
    }

    try {
        await prisma.group.update({
            where: { id: data.groupId },
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
    // const parseResult = EditGroupSchema.safeParse(data)
        
    // if (!parseResult.success) {
    //     const flattened = parseResult.error.flatten()
        
    //     Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
    //         messages.forEach(message => addError(errors, field, message))
    //     })
        
    //     flattened.formErrors.forEach(message => addError(errors, "root", message))
    // }
    // //console.log(data.slug)
    // //console.log(errors)

            
    // if (data.slug && !errors["slug"] && data.slug !== group.slug) {
    //     const existingSlug = await prisma.group.findUnique({
    //         where: {slug: data.slug}
    //     })

    //     if (existingSlug && existingSlug.id !== group.id) {
    //         addError(errors, "slug", "Podany odnośnik jest już zajęty")
    //     }
    // }

//     const dataToUpdate = Object.fromEntries(
//         Object.entries(data).filter(([key, value]) =>
//             !errors[key] && value !== group[key as keyof typeof group]
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
//         await prisma.group.update({
//             where: {id: groupId},
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

const GetGroupBySlug = async (slug: string) => {
    try {
        return await prisma.group.findUnique({where: {slug}})
    } catch (error) {
        return null
    }
}

export const GetGroupById = async (id: string) => {
    try {
        return await prisma.group.findUnique({ where: {id}})
    } catch(error) {
        console.error("Błąd podczas pobierania grupy:", error)
        return null
    }
}