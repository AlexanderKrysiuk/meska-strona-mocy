import { CirclePile, User } from "lucide-react"

export const routes = {
    start: "/auth/start",
    resetPassword: "/auth/reset",
    newPassword: "/auth/new-password",
    kokpit: "/kokpit",
    verify: "/verify",
    signOutRedirect: "/",
    signInRedirect: "/"
}

type UserMenuItem = {
    label: string,
    href: string,
    icon: React.ElementType,
}

type UserMenuSection = {
    label: string,
    items: UserMenuItem[],
    prefix: string
    roles?: string[]
}


export const UserMenu: UserMenuSection[] = [
    {
        label: "Użytkownik",
        prefix: "",
        items: [
            {
                label: "Profil",
                href: "/profil",
                icon: User
            }
        ] 
    },
    {
        label: "Moderator",
        prefix: "/moderator",
        roles:["moderator"],
        items: [
            {
                label: "Moje kręgi",
                href: "/moje-kregi",
                icon: CirclePile,
            }
        ]
    }
]