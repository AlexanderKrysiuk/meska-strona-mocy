"use server"

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MycircleWrapper from "./wrapper";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

const MycirclePage = async (
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
    const circle = await prisma.circle.findUnique({
        where: { id: params.id }
    })
    
    if (!circle) return redirect("/moderator/moje-grupy")
    if (session.user.id !== circle?.moderatorId && session.user.role !== Role.Admin) return redirect("/moderator/")
    
    const meetings = await prisma.circleMeeting.findMany({
        where: {
            circleId: params.id,
            startTime: {gte: new Date()}
        },
        orderBy: {
            startTime: "asc"
        }
    })

    const countries = await prisma.country.findMany()
    const regions = await prisma.region.findMany()
    const cities = await prisma.city.findMany()
    
    return <MycircleWrapper 
        circle={circle}
        meetings={meetings}
        countries={countries}
        regions={regions}
        cities={cities}
    />
}
 
export default MycirclePage