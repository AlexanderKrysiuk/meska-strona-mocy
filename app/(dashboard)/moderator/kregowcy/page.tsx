"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import CircleMembersWrapper from "./wrapper";

const CircleMembersPage = async () => {
    const user = await CheckLoginOrRedirect()

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return redirect("/")

    const circlesWithMembers = await prisma.circle.findMany({
        where: { moderatorId: user.id },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    })  

    return <CircleMembersWrapper circlesWithMembers={circlesWithMembers}/>         
}
 
export default CircleMembersPage;