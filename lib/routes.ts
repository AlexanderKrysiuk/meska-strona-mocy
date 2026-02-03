import { User } from "lucide-react"

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
    icon: React.ElementType
}

type UserMenuSection = {
    label: string,
    items: UserMenuItem[]
}

export const UserMenu: UserMenuSection[] = [
    {
        label: "Użytkownik",
        items: [
            {
                label: "Profil",
                href: "/profil",
                icon: User
            }
        ] 
    }
]