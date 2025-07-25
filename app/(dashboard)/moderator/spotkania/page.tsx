"use server"

import { CheckLoginOrRedirect } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { Divider } from "@heroui/divider";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import MeetingsWrapper from "./wrapper";

const MeetingsPage = async () => {
    const user = await CheckLoginOrRedirect()

    if (![Role.Admin, Role.Moderator].includes(user.role as Role)) return redirect("/")

    const groups = await prisma.group.findMany({
        where: {
            moderatorId: user.id
        }
    })

    const groupsIds = groups.map(group => group.id)

    const meetings = await prisma.groupMeeting.findMany({
        where: {
            groupId: {
                in: groupsIds
            }
        }
    })

    const countries = await prisma.country.findMany()
    const regions = await prisma.region.findMany()
    const cities = await prisma.city.findMany()

    return  (
        <div>
            <MeetingsWrapper 
                groups={groups} 
                meetings={meetings} 
                countries={countries} 
                regions={regions} 
                cities={cities}            
            />
            <Divider/>
            <pre>{JSON.stringify(meetings,null,2)}</pre>
            <Divider/>
            <pre>{JSON.stringify(groups,null,2)}</pre>    
        </div>
    )
}
 
export default MeetingsPage;