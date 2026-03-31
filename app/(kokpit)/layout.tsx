//app/kokpit/layout.tsx
"use client"

import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent } from "@/components/ui/navigation-menu"
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSession } from "@/auth/auth-client"
import { routes, UserMenu } from "@/lib/routes"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

const KokpitLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session, isPending } = useSession()

    useEffect(() => {
        if (!isPending && !session) router.push(routes.start)
    }, [isPending, session, router])

    if (isPending) return null // albo loader

    return <main className="flex flex-1">
        <nav className="border-r hidden lg:block">
            {UserMenu
                .filter(section => !section.roles || (session?.user?.role && section.roles.includes(session.user.role)))
                .map((section) => (
                <div key={section.label}>

                    <span className="px-2 text-xs font-medium text-muted-foreground">
                        {section.label}
                    </span>
                    <ul>
                        {section.items.map((item) => (
                            <Button key={item.label}
                                asChild
                                size="sm"
                                variant={pathname === `${section.prefix}${item.href}` ? "default" : "ghost"}
                                //variant="ghost"
                                className="rounded-none w-full justify-start cursor-pointer"
                            >
                                <Link href={`${section.prefix}${item.href}`}>
                                    <item.icon/> {item.label}
                                </Link>
                            </Button>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
            


        {children}
    

    </main>
}

export default KokpitLayout