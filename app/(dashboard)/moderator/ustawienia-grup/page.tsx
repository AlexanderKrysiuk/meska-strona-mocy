"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import GroupSettingsWrapper from "./wrapper";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const GroupSettingsPage = async () => {
    const user = await CheckLoginOrRedirect()

    if (user.role !== Role.Admin && user.role !== Role.Moderator ) return redirect("/")
    
    const groups = await prisma.group.findMany({
        where: {
            moderatorId: user.id
        }
    })

    const countries = await prisma.country.findMany()
    const regions = await prisma.region.findMany()
    const cities = await prisma.city.findMany()

    return <GroupSettingsWrapper 
        groups={groups}
        countries={countries}
        regions={regions}
        cities={cities}
    />
}
 
export default GroupSettingsPage;