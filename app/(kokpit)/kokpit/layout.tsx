"use client"

import { KokpitMenu } from "@/components/user-menu";
import { Divider } from "@heroui/react";

const KokpitClientLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
    return <main className="flex flex-grow">
        <div className="hidden lg:block border-r border-foreground-200" suppressHydrationWarning>
            <KokpitMenu/>
            <Divider
                orientation="vertical"
            />
        </div>
        <section className="w-full">
            {children}
        </section>
    </main>
}
 
export default KokpitClientLayout;