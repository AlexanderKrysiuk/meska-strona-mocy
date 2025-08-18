"use client"

import { ModeratorItems } from "@/components/user-menu";
import { useCurrentUser } from "@/hooks/user";
import { PermissionGate } from "@/utils/gate";
import { Listbox, ListboxItem, ListboxSection } from "@heroui/react";
import { Role } from "@prisma/client";
import { usePathname } from "next/navigation";

const DashboadLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
    const user = useCurrentUser()
    const pathname = usePathname()
    return ( 
        <main className="h-full lg:grid lg:grid-cols-5">
            <div className="hidden lg:block lg:col-span-1 border-r border-foreground-200">
                {user && (
                    <Listbox
                        className="pr-0"
                        aria-label="Dashboard Menu"
                    >
                        {PermissionGate(user.roles, [Role.Moderator]) ? (
                            <ListboxSection
                                showDivider
                                title="Moderator"
                                items={ModeratorItems}
                            >
                                {(item)=>(
                                    <ListboxItem
                                        key={item.title}
                                        title={item.title}
                                        href={item.href}
                                        color={pathname.startsWith(item.href) ? "primary" : "default"}
                                        startContent={item.icon}
                                        className={`rounded-none ${pathname.startsWith(item.href) && "text-primary border-r-4 border-primary hover:text-white"} transition-colors duration-400`}
                                    />
                                )}
                            </ListboxSection>
                        ) : null}
                    </Listbox>
                )}
            </div>
            <div className="lg:col-span-4">
                {children}
            </div>
        </main>
    );
}
 
export default DashboadLayout;