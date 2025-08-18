"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import CircleMembersWrapper from "./wrapper";
import { PermissionGate } from "@/utils/gate";

const CircleMembersPage = async () => {
    const user = await CheckLoginOrRedirect()

    if (!PermissionGate(user.roles, [Role.Moderator])) return redirect("/")

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