"use client"

import { ModeratorItems } from "@/components/user-menu";
import { clientAuth } from "@/hooks/auth";
import { PermissionGate } from "@/utils/gate";
import { Listbox, ListboxItem, ListboxSection } from "@heroui/react";
import { Role } from "@prisma/client";
import { usePathname } from "next/navigation";

const DashboadLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
    const user = clientAuth()
    const pathname = usePathname()
    return ( 
        <main className="lg:grid lg:grid-cols-5 flex-1">
            <div className="hidden lg:block lg:col-span-1 border-r border-foreground-200">
                {user && (
                    <Listbox
                        className="pr-0"
                        aria-label="Dashboard Menu"
                    >
                        {/* <ListboxSection
                            showDivider
                            title="Użytkownik"
                            items={userItems}
                        >
                            {(item)=><ListboxItem
                                key={item.title}
                                title={item.title}
                                href={item.href}
                                color={pathname.startsWith(item.href) ? "primary" : "default"}
                                startContent={item.icon}
                                className={`rounded-none ${pathname.startsWith(item.href) && "text-primary border-r-4 border-primary hover:text-white"} transition-colors duration-400`}
                            />}
                        </ListboxSection> */}
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
                        {/* {user.roles.length > 0 ? 
                            <ListboxSection
                                showDivider
                                title="Partner"
                                items={PartnerItems}
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
                        : null } */}
                    </Listbox>
                )}
            </div>
            <div className="lg:col-span-4 flex flex-col flex-1">
                {children}
            </div>
        </main>
    );
}
 
export default DashboadLayout;