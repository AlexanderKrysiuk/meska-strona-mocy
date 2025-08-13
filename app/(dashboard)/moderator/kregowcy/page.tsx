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

    const Memberships = await prisma.circleMembership.findMany({
        where: {
            circleId: {
                in: circleIds
            }
        }
    })
    
    const usersIds = Memberships.map(membership => membership.userId)

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: usersIds
            }
        },
        select: {
            name: true
        }
    })



    return (
        <pre>
            <CircleMembersWrapper
                users={users}
            />
            KRĘGOWCY<br/>
            {JSON.stringify(users,null,2)}          
        </pre>
    )
}
 
export default MycirclesPage;