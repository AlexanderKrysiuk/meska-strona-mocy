//app/auth/layout.tsx
"use client"

import { useSession } from "@/lib/auth-client"
import { routes } from "@/lib/routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const AuthLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
    const router = useRouter()
    const { data: session } = useSession()

    useEffect(() => {
        if (session) router.push(routes.signInRedirect)
    }, [session, router])

    if ( session === undefined ) return

    return <main className="flex w-full justify-center py-[20vh]">
        {children}
    </main>
}

export default AuthLayout