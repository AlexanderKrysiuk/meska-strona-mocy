export const dynamic = "force-dynamic"

import { authClient } from "@/auth/auth-client"
import { routes } from "@/lib/routes"
import { redirect } from "next/navigation"


const PaymentsPage = async () => {
    if (!await authClient.admin.hasPermission({permission: { earnings: ["view"]}})) redirect(routes.kokpit)
    return <main>
        123
    </main>
}
export default PaymentsPage