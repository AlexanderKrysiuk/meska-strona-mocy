"use client"

import { authClient } from "@/auth/auth-client"
import { routes } from "@/lib/routes"
import { redirect } from "next/navigation"

const EarningsPage = () => {
    if (!authClient.admin.hasPermission({ permission: { earnings: ["view"]}})) redirect(routes.kokpit)
    
    return <main>
        456
    </main>
}
export default EarningsPage