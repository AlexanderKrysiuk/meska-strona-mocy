//app/auth/layout.tsx
"use client"

import { useSession } from "@/auth/auth-client"
import { routes } from "@/lib/routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && session) {
      router.push(routes.signInRedirect)
    }
  }, [isPending, session, router])

  if (isPending) return null // albo loader

  return (
    <main className="flex w-full justify-center py-[20vh]">
      {children}
    </main>
  )
}

export default AuthLayout