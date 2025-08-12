"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import CircleSettingsWrapper from "./wrapper";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const CircleSettingsPage = async () => {
    const user = await CheckLoginOrRedirect()

    if (user.role !== Role.Admin && user.role !== Role.Moderator ) return redirect("/")
    
    const circles = await prisma.circle.findMany({
        where: {
            moderatorId: user.id
        }
    })

    const countries = await prisma.country.findMany()
    const regions = await prisma.region.findMany()
    const cities = await prisma.city.findMany()

    return <CircleSettingsWrapper 
        circles={circles}
        countries={countries}
        regions={regions}
        cities={cities}
    />
}
 
export default CircleSettingsPage;