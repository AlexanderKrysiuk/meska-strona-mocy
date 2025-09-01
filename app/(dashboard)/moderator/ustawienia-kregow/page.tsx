"use client"

import { GetModeratorCircles } from "@/actions/circle";
import Loader from "@/components/loader";
import CreateCircleModal from "@/components/moderator/create-circle-modal";
import EditCircleForm from "@/components/moderator/edit-circle-form";
import { clientAuth } from "@/hooks/auth";
import { ModeratorQueries } from "@/utils/query";
import { Divider, Select, SelectItem } from "@heroui/react";
import { Circle } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const CircleSettingsPage = () => {
    
    return <main className="p-4">
        <EditCircleForm/>
       
    </main>;
}
 
export default CircleSettingsPage;

// "use server"

// import { CheckLoginOrRedirect } from "@/actions/auth";
// import { prisma } from "@/lib/prisma";
// import CircleSettingsWrapper from "./wrapper";
// import { Role } from "@prisma/client";
// import { redirect } from "next/navigation";
// import { PermissionGate } from "@/utils/gate";

// const CircleSettingsPage = async () => {
//     const user = await CheckLoginOrRedirect()

//     if (!PermissionGate(user.roles, [Role.Moderator])) return redirect("/")
    
//     const circles = await prisma.circle.findMany({
//         where: {
//             moderatorId: user.id
//         }
//     })

//     const countries = await prisma.country.findMany()
//     const regions = await prisma.region.findMany()
//     const cities = await prisma.city.findMany()

//     return <CircleSettingsWrapper 
//         circles={circles}
//         countries={countries}
//         regions={regions}
//         cities={cities}
//     />
// }
 
// export default CircleSettingsPage;