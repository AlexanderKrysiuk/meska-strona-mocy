"use client"

import { GetModeratorCircles } from "@/actions/circle";
import Loader from "@/components/loader";
import AddCircleMemberModal from "@/components/moderator/add-circle-member-modal";
import CircleMembersTable from "@/components/moderator/circle-members-table";
import CreateCircleModal from "@/components/moderator/circles/create-circle-modal";
import { clientAuth } from "@/hooks/auth";
import { ModeratorQueries } from "@/utils/query";
import { Divider, Select, SelectItem } from "@heroui/react";
import { Circle } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const CircleMembersPage = () => {
    const moderator = clientAuth()

    const { data: circles } = useQuery({
        queryKey: [ModeratorQueries.Circles, moderator?.id],
        queryFn: () => GetModeratorCircles(moderator!.id),
        enabled: !!moderator
    })

    const [circle, setCircle] = useState<Circle | undefined>()

    if (!circles) return <Loader/>
    
    return ( 
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Krąg"
                    items={circles}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    onSelectionChange={(keys) => {
                        const id = Array.from(keys)[0];
                        const circle = circles.find(c => c.id === id);
                        setCircle(circle)
                    }}
                    isDisabled={circles.length < 1}
                    hideEmptyContent
                    >
                    {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                </Select>
                <CreateCircleModal/>
            </div>
            <Divider/>
            <div className="flex space-x-4 items-center">
                <h6 className="w-full">Kręgowcy</h6>
                <AddCircleMemberModal
                    circles={circles}
                    circle={circle}
                />
            </div>
            <CircleMembersTable 
                circles={circles}
                circle={circle}
            />
        </main>
     );
}
 
export default CircleMembersPage;

// "use server"

// import { CheckLoginOrRedirect } from "@/actions/auth";
// import { prisma } from "@/lib/prisma";
// import { Role } from "@prisma/client";
// import { redirect } from "next/navigation";
// import CircleMembersWrapper from "./wrapper";
// import { PermissionGate } from "@/utils/gate";

// const CircleMembersPage = async () => {
//     const user = await CheckLoginOrRedirect()

//     if (!PermissionGate(user.roles, [Role.Moderator])) return redirect("/")

//     const circlesWithMembers = await prisma.circle.findMany({
//         where: { moderatorId: user.id },
//         include: {
//             members: {
//                 include: {
//                     user: {
//                         select: {
//                             id: true,
//                             name: true,
//                             email: true,
//                             image: true
//                         }
//                     }
//                 }
//             }
//         }
//     })  

//     return <CircleMembersWrapper circlesWithMembers={circlesWithMembers}/>         
// }
 
// export default CircleMembersPage;