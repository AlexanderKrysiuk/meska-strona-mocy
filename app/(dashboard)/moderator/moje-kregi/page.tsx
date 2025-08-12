"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import MycirclesWrapper from "./wrapper";

const MycirclesPage = async () => {
    const user = await CheckLoginOrRedirect()

    const circles = await prisma.circle.findMany({
        where: {
            moderatorId: user.id
        }
    })

    return <MycirclesWrapper circles={circles}/>
}
 
export default MycirclesPage;