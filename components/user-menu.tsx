"use client"

import { clientAuth } from "@/hooks/auth"
import { faGears, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Listbox, ListboxItem, ListboxSection } from "@heroui/react"
import { Role } from "@prisma/client"
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
                            className={`rounded-none ${pathname.startsWith(item.href) && "text-primary border-4 border-primary hover:text-white"}`}
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