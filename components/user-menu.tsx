"use client"

import { faGears, faPeopleGroup } from "@fortawesome/free-solid-svg-icons"
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
    }
]