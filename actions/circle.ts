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
import { sendEmail } from "@/lib/resend"
import { CircleChangeEmail } from "@/components/emails/Circle-Change"

export const CreateCircle = async (data: z.infer<typeof CreateCircleSchema>) => {
    const auth = await ServerAuth()

    if (!auth) return {
        success: false,
        message: "Musisz być zalogowanym by utworzyć krąg"
    }

    if (!auth.roles.includes(Role.Moderator) && !auth.roles.includes(Role.Admin)) return {
        success: false,
        message: "Brak uprawnień do dodania kręgu"
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
                moderatorId: auth.id,
                name: data.name,
                slug: slug,
                street: data.street,
                cityId: data.cityId,
                price: data.price,
                newUserPrice: data.newUserPrice,
                currency: data.currency,
                public: data.isPublic,
                timeZone: data.timeZone,
                plannedWeekday: data.plannedWeekday,
                startHour: data.hours.start,
                endHour: data.hours.end,
                frequencyWeeks: data.frequencyWeeks,
                minMembers: data.members.min,
                maxMembers: data.members.max,
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
        message: "Pomyślnie dodano nowy krąg"
    }
}

export const EditCircle = async (data: z.infer<typeof EditCircleSchema>) => {    
    const auth = await ServerAuth()

    if (!auth) return {
        success: false,
        message: "Musisz być zalogowanym aby edytować krąg"
    }

    const circle = await GetCircleByID(data.circleId)

    if (!circle) return {
        success: false,
        message: "Dana grupa nie istnieje"
    }

    if (!(auth.roles.includes(Role.Admin) || (auth.roles.includes(Role.Moderator) && auth.id === circle.moderator.id))) return {
        success: false,
        message: "Brak uprawień do edycji grupy"
    }

    if (circle.slug !== data.slug) {
        const existingSlug = await GetCircleBySlugAndModeratorID(data.slug, circle.moderator.id)

        if (existingSlug) return {
            success: false,
            message: "Nie udało się zaktualizować grupy",
            fieldErrors: { slug: "Podany odnośnik jest już zajęty"}
        }
    }

    try {
        const updated = await prisma.circle.update({
            where: { id: data.circleId },
            data: {
                name: data.name,
                slug: data.slug,
                maxMembers: data.members.max,
                minMembers: data.members.min,
                street: data.street,
                cityId: data.cityId,
                price: data.price,
                newUserPrice: data.newUserPrice,
                currency: data.currency,
                public: data.isPublic
            },
            select: {
                name: true,
                street: true,
                price: true,
                currency: true,
                city: { select:{
                    id: true,
                    name: true,
                }},
                members: { 
                    where: {
                        status: "Active"
                    },
                    select: { 
                        user: { select: {
                            name: true,
                            email: true,
                    }}
                }}
            }
        })

        if (
            circle.name !== updated.name ||
            circle.street !== updated.street ||
            circle.city?.id !== updated.city?.id ||
            circle.price !== updated.price ||
            circle.currency !== updated.currency
        ) {
            try {
                for (const member of updated.members) {
                    await sendEmail({
                        to: member.user.email,
                        subject: `Zmiany w kręgu ${circle.name}`,
                        react: CircleChangeEmail({
                            oldCircle: circle,
                            newCircle: updated,
                            member: member.user,
                            moderator: circle.moderator,
                            
                        })
                    })
                }
            } catch(error) {
                console.error(error)
            }
        }

    } catch(error) {
        console.error(error)
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
            slug: true,
            street: true,
            price: true,
            currency: true,
            city: { select: {
                id: true,
                name: true
            }},
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
        where: {moderatorId: moderatorID},
        select: {
            id: true,
            name: true,
            slug: true,
            maxMembers: true,
            minMembers: true,
            street: true,
            public: true,
            price: true,
            newUserPrice: true,
            currency: true,
            city: {
                select: {
                    id: true,
                    name: true,
                    region: {
                        select: {
                            country: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}

export const GetCirclesForLandingPage = async (page = 0, PAGE_SIZE = 1) => {
    //const PAGE_SIZE = 1
   //const page = 0

    const circles = await prisma.circle.findMany({
        where: { public: true },
        select: {
            id: true,
            name: true,
            slug: true,

            maxMembers: true,
            street: true,
            
            price: true,
            newUserPrice: true,
            currency: true,

            plannedWeekday: true,
            startHour: true,
            endHour: true,
            frequencyWeeks: true,

            timeZone: true,

            _count: { select: { members: { where: { status: {in: ["Active", "Pending"]} }}}},
            moderator: { select: {
                name: true,
                image: true
            }},
            city: { select: {
                name: true,
                region: { select: {
                    country: { select: {
                        locale: true
                    }}
                }}
            }},
            meetings: { 
                select: {
                    id: true,
                },
                take: 3
            }
        },
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE
    })

    return circles
        .filter((circle) => circle._count.members < circle.maxMembers)
        // .sort((a,b) => {
        //     const aDate = a.meetings[0]?.startTime?.getTime() ?? Infinity
        //     const bDate = b.meetings[0]?.startTime?.getTime() ?? Infinity
        //     return aDate - bDate
        // })
}