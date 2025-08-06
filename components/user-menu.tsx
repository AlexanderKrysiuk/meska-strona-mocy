"use client"

import { faCalendar, faGears, faPeopleGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const AllItems = [
    {
        href: "/meskie-kregi",
        icon: null,
        title: "Męskie Kręgi"
    }
]

export const ModeratorItems = [
    {
        href: "/moderator/moje-kregi",
        icon: <FontAwesomeIcon icon={faPeopleGroup}/>,
        title: "Moje kręgi"
    },
    {
        href: "/moderator/ustawienia-kregow",
        icon: <FontAwesomeIcon icon={faGears}/>,
        title: "Ustawienia kręgów"
    },
    {
        href: "/moderator/spotkania-kregow",
        icon: <FontAwesomeIcon icon={faCalendar}/>,
        title: "Spotkania kręgów"
    }
]