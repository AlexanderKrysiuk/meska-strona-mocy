"use client"

import { useSession } from "@/auth/auth-client"
import { routes } from "@/lib/routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const ModeratorLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
    const router = useRouter()
    const { data: session, isPending } = useSession()

    useEffect(() => {
        if (!isPending && !session ) router.push(routes.start)
        if (!session?.user.role?.includes("moderator")) router.push(routes.kokpit)
    })
    return <main>
        {children}
    </main>
}
export default ModeratorLayout