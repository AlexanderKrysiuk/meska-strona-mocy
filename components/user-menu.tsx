"use client"

import { faCalendar, faGears, faPeopleGroup, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const AllItems = [
    {
        href: "/meskie-kregi",
        icon: null,
        title: "Męskie Kręgi"
    }
]

export const userItems = [
    {
        href: "/konto/profil",
        icon: <FontAwesomeIcon icon={faUser}/>,
        title: "Profil"
    },
    {
        href: "/konto/moje-kregi",
        icon: <FontAwesomeIcon icon={faPeopleGroup}/>,
        title: "Moje Kręgi"
    }
]

export const ModeratorItems = [
    {
        href: "/moderator/kregowcy",
        icon: <FontAwesomeIcon icon={faPeopleGroup}/>,
        title: "kręgowcy"
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