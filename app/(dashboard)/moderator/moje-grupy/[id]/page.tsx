"use server"

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyGroupWrapper from "./wrapper";

const MyGroupPage = async ({
    params
} : {
    params: {
        id: string
    }
}) => {

    await params
    const group = await prisma.group.findUnique({
        where: { id: params.id }
    })

    if (!group) return redirect("/moderator/moje-grupy")

    const meetings = await prisma.groupMeeting.findMany({
        where: {
            groupId: params.id,
            startTime: {gte: new Date()}
        },
        orderBy: {
            startTime: "asc"
        }
    })

    return <MyGroupWrapper 
        group={group}
        meetings={meetings}
    />
}
 
export default MyGroupPage