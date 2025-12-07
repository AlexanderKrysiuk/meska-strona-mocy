"use client"

import { clientAuth } from "@/hooks/auth"
import { faArrowRightFromBracket, faArrowRightToBracket, faGears, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Avatar, Divider, DropdownItem, DropdownMenu, DropdownSection, Link, Listbox, ListboxItem, ListboxSection, NavbarMenu, NavbarMenuItem } from "@heroui/react"
import { Role } from "@prisma/client"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export const AllItems = [
    {
        href: "/meskie-kregi",
        icon: null,
        title: "Męskie Kręgi"
    }
]

export const userItems = [
    {
        href: "/kokpit/konto/profil",
        icon: <FontAwesomeIcon icon={faUser}/>,
        title: "Profil"
    },
//     {
//         href: "/konto/moje-kregi",
//         icon: <FontAwesomeIcon icon={faPeopleGroup}/>,
//         title: "Moje Kręgi"
//     }
]

export const ModeratorItems = [
    // {
    //     href: "/moderator/kregowcy",
    //     icon: <FontAwesomeIcon icon={faPeopleGroup}/>,
    //     title: "kręgowcy"
    // },
    {
        href: "/kokpit/moderator/ustawienia-kregow",
        icon: <FontAwesomeIcon icon={faGears}/>,
        title: "Ustawienia kręgów"
    },
    // {
    //     href: "/moderator/spotkania-kregow",
    //     icon: <FontAwesomeIcon icon={faCalendar}/>,
    //     title: "Spotkania kręgów"
    // }
]

export const PartnerItems = [
//     {
//         href: "/partner/ustawienia",
//         icon: <FontAwesomeIcon icon={faGear}/>,
//         title: "Ustawienia"
//     },
//     // {
//     //     href: "/partner/platnosci",
//     //     icon: <FontAwesomeIcon icon={faWallet}/>,
//     //     title: "Płatności"
//     // }
]

export const KokpitMenu = () => {
    const user = clientAuth()
    const pathname = usePathname()

    return <>
        {/* {user?.roles.includes(Role.Moderator) && 
            <Listbox
                className="pr-0"
            >
                <ListboxSection
                    showDivider
                    title="Moderator"
                    items={ModeratorItems}
                >
                    {(item)}
                </ListboxSection>
            </Listbox>
        } */}
        <Listbox
            className="pr-0"
        >
            {user ? (
                <ListboxSection
                    showDivider
                    title="Użytkownik"
                    items={userItems}
                >
                    {(item) => (
                        <ListboxItem
                            key={item.title}
                            title={item.title}
                            href={item.href}
                            color={pathname.startsWith(item.href) ? "primary" : "default"}
                            startContent={item.icon}
                            className={`rounded-none ${pathname.startsWith(item.href) && "text-primary border-r-4 border-primary hover:text-white"}`}
                        />
                    )}
                </ListboxSection>
            ) : null}
            {user?.roles.includes(Role.Moderator) ? (
                <ListboxSection
                showDivider
                title="Moderator"
                items={ModeratorItems}
                >
                    {(item) => (
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
    </>
}

export const DropMenu = () => {
    const user = clientAuth()
    const pathname = usePathname()

    return <DropdownMenu>
        {user ? (
            <DropdownSection
                title="Użytkownik"
                showDivider
                items={userItems}
            >
                {(item) => (
                    <DropdownItem
                        key={item.title}
                        href={item.href}
                        title={item.title}
                        variant="light"
                        color="primary"
                        startContent={item.icon}
                        className={`${pathname.startsWith(item.href) && "text-primary"}`}
                    />
                )}
            </DropdownSection>
        ) : null}
        {user?.roles.includes(Role.Moderator) ? (
            <DropdownSection
                title="Moderator"
                showDivider
                items={ModeratorItems}
            >
                {(item) => (
                    <DropdownItem
                        key={item.title}
                        href={item.href}
                        title={item.title}
                        variant="light"
                        color="primary"
                        startContent={item.icon}
                        className={`${pathname.startsWith(item.href) && "text-primary"}`}
                    />
                )}
            </DropdownSection>
        ) : null}
        <DropdownItem
            key="Logout"
            color="danger"
            variant="light"
            startContent={<FontAwesomeIcon icon={faArrowRightFromBracket}/>}
            onPress={()=>{signOut()}}
            className="rounded-none"
        >
            Wyloguj
        </DropdownItem>
    </DropdownMenu>
}

export const MobileMenu = () => {
    const user = clientAuth()
    //const { data: session, status } = useSession();
    //const user = session?.user;
    const pathname = usePathname();

    //if (status === "loading") return null;

    return (
        <NavbarMenu>
            {/* Użytkownik */}
            {user && (
                <>
                    <NavbarMenuItem>
                        <div className="flex justify-between items-center mb-1">
                            Witaj {user.name}
                            <Avatar size="sm" showFallback src={user.image ?? undefined} />
                        </div>
                    </NavbarMenuItem>
                    <Divider/>
                    {/* Sekcja użytkownika */}
                    <NavbarMenuItem>
                        <span className="text-sm text-foreground-500">Użytkownik</span>
                    </NavbarMenuItem>

                    {userItems.map((item) => (
                        <NavbarMenuItem key={item.title}>
                            <Link
                                href={item.href}
                                color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                                className="flex gap-2 transition-colors duration-400"
                            >
                                {item.icon} {item.title}
                            </Link>
                        </NavbarMenuItem>
                    ))}

                    {/* Moderator */}
                    {user.roles.includes(Role.Moderator) && (
                        <>
                            <NavbarMenuItem>
                                <span className="text-sm text-foreground-500">Moderator</span>
                            </NavbarMenuItem>

                            {ModeratorItems.map((item) => (
                                <NavbarMenuItem key={item.title}>
                                    <Link
                                        href={item.href}
                                        color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                                        className="flex gap-2 transition-colors duration-400"
                                    >
                                        {item.icon} {item.title}
                                    </Link>
                                </NavbarMenuItem>
                            ))}
                        </>
                    )}
                    <Divider/>
                    {/* Ogólne */}
                    {AllItems.map((item) => (
                        <NavbarMenuItem key={item.title}>
                            <Link
                                href={item.href}
                                color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                            >
                                {item.title}
                            </Link>
                        </NavbarMenuItem>
                    ))}

                    {/* Wyloguj */}
                    <NavbarMenuItem>
                        {user ? 
                            <Link
                                onPress={() => signOut()}
                                color="danger"
                                className="cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2" /> Wyloguj
                            </Link>
                                :
                            <Link href="/auth/start">
                                <FontAwesomeIcon icon={faArrowRightToBracket} className="mr-2"/> Start
                            </Link>
                        }   
                    </NavbarMenuItem>
                </>
            )}
        </NavbarMenu>
    );
};



// //export const MobileMenu = () => {
//     //const user = clientAuth()
//     const { data: session, status } = useSession();
//     const user = session?.user;
//     const pathname = usePathname()

//     if (status === "loading") return null

//     return <NavbarMenu>
//         <NavbarMenuItem>
//             <Link
//                 href="/auth/start"
//             >
//                 <FontAwesomeIcon icon={faArrowRightToBracket} className="mr-2"/> Start
//             </Link>
//         </NavbarMenuItem>
//         {user && <>
//             <NavbarMenuItem>
//                 <div className="flex justify-between items-center mb-1">
//                     Witaj {user.name}
//                     <Avatar
//                         size="sm"
//                         showFallback
//                         src={user.image ?? undefined}
//                     />
//                 </div>
//             </NavbarMenuItem>
//             <span className="text-sm text-foreground-500">
//                 Użytkownik
//             </span>
//             <div className="space-y-4">
//                 {userItems.map((item) => 
//                     <NavbarMenuItem
//                         key={item.title}
//                     >
//                         <Link
//                             href={item.href}
//                             color={pathname.startsWith(item.href) ? "primary" : "foreground"}
//                             className="flex gap-2 hover:primary transition-colors duration-400"
//                         >
//                             {item.icon} {item.title}
//                         </Link>
//                     </NavbarMenuItem>
//                 )}
//                 <Divider/>
//                 {user.roles.includes(Role.Moderator) && <>
//                     <span className="text-sm text-foreground-500">
//                         Moderator
//                     </span>
//                     {ModeratorItems.map((item) => 
//                         <NavbarMenuItem
//                             key={item.title}
//                         >
//                             <Link
//                                 href={item.href}
//                                 color={pathname.startsWith(item.href) ? "primary" : "foreground"}
//                                 className="flex gap-2 hover:primary transition-colors duration-400"
//                             >
//                                 {item.icon} {item.title}
//                             </Link>
//                         </NavbarMenuItem>
//                     )}
//                     <Divider/>
//                 </>}
//                 {AllItems.map((item) =>
//                     <NavbarMenuItem
//                         isActive={pathname.startsWith(item.href)}
//                         key={item.title}
//                     >
//                         <Link
//                             color={pathname.startsWith(item.href) ? "primary" : "foreground"}
//                             href={item.href}
//                         >
//                             {item.title}
//                         </Link>
//                     </NavbarMenuItem>
//                 )}
//                 <NavbarMenuItem>
//                     {user ?
//                         <Link
//                             onPress={()=>signOut()}
//                             color="danger"
//                             className="cursor-pointer"
//                         >
//                             <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2"/> Wyloguj
//                         </Link>
//                         :
//                         <Link
//                             href="/auth/start"
//                         >
//                             <FontAwesomeIcon icon={faArrowRightToBracket} className="mr-2"/> Start
//                         </Link>
//                     }
//                 </NavbarMenuItem>
//             </div>
//         </>}
//     </NavbarMenu>
// //}