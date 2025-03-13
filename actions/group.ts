"use server"

import { prisma } from "@/lib/prisma"
import { CreateGroupSchema } from "@/schema/group"
import { z } from "zod"
import { GetUserByID } from "./auth"
import { Role } from "@prisma/client"

export const CreateGroup = async (data: z.infer<typeof CreateGroupSchema>) => {
    const user = await GetUserByID()

    if (user.role !== Role.Admin && user.role !== Role.Moderator) throw new Error("Brak uprawnień do tworzenia grupy")

    try {
        await prisma.group.create({
            data: {
                name: data.name,
                moderatorId: user.id,
                maxMembers: data.maxMembers
            }
        })
    } catch (error) {
        throw new Error("Błąd połączenia z bazą danych")
    }
}