"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import CircleMembersWrapper from "./wrapper";

const MycirclesPage = async () => {
    const user = await CheckLoginOrRedirect()

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return redirect("/")


    const circles = await prisma.circle.findMany({
        where: {moderatorId: user.id}
    })

    const circleIds = circles.map(circle => circle.id);

    const memberships = await prisma.circleMembership.findMany({
        where: {
            circleId: {
                in: circleIds
            }
        }
    })
    
    const usersIds = memberships.map(membership => membership.userId)

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: usersIds
            }
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    })



    return (
        <pre>
            <CircleMembersWrapper
                users={users}
                memberships={memberships}
                circles={circles}
            />         
        </pre>
    )
}
 
export default MycirclesPage;