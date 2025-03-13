"use server"

import { GetUserByID } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import MyGroupsWrapper from "./wrapper";

const MyGroupsPage = async () => {
    const user = await GetUserByID()

    const groups = await prisma.group.findMany({
        where: {
            moderatorId: user.id
        }
    })

    return <MyGroupsWrapper groups={groups}/>
}
 
export default MyGroupsPage;