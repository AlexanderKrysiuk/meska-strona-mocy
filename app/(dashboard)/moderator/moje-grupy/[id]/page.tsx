"use server"

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyGroupWrapper from "./wrapper";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

const MyGroupPage = async (
    props: {
        params: Promise<{
            id: string
        }>
    }
) => {
    const session = await auth()
    if (!session) return redirect("/auth/start")

    const params = await props.params;

    await params
    const group = await prisma.group.findUnique({
        where: { id: params.id }
    })
    
    if (!group) return redirect("/moderator/moje-grupy")
    if (session.user.id !== group?.moderatorId && session.user.role !== Role.Admin) return redirect("/moderator/")
    
    const meetings = await prisma.groupMeeting.findMany({
        where: {
            groupId: params.id,
            startTime: {gte: new Date()}
        },
        orderBy: {
            startTime: "asc"
        }
    })

    const countries = await prisma.country.findMany()
    const regions = await prisma.region.findMany()
    const cities = await prisma.city.findMany()
    
    return <MyGroupWrapper 
        group={group}
        meetings={meetings}
        countries={countries}
        regions={regions}
        cities={cities}
    />
}
 
export default MyGroupPage