import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const ServerModeratorLayout = async ({
    children
} : {
    children: React.ReactNode
}) => {
    const session = await auth()

    if (!session || !session.user.roles.includes(Role.Moderator)) redirect("/")

    return <>{children}</>;
}
 
export default ServerModeratorLayout;