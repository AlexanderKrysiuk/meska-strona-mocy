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
        href: "/moderator/moje-grupy",
        icon: <FontAwesomeIcon icon={faPeopleGroup}/>,
        title: "Moje grupy"
    },
    {
        href: "/moderator/ustawienia-grup",
        icon: <FontAwesomeIcon icon={faGears}/>,
        title: "Ustawienia Grup"
    },
    {
        href: "/moderator/spotkania",
        icon: <FontAwesomeIcon icon={faCalendar} className="mr-2"/>,
        title: "Spotkania"
    }
]