//components/user/user-menu.tsx
"use client"

import { ac } from "@/auth/permissions"
import { CirclePile, UserIcon, Wallet } from "lucide-react"

type UserMenuItem = {
    label: string,
    href: string,
    icon: React.ElementType
    accessTatement? : keyof typeof ac.statements
}

type UserMenuSection = {
  label: string
  items: UserMenuItem[]
  prefix: string
  roles?: string[] // 👈 to dodajemy
}

export const UserMenu: UserMenuSection[] = [
  {
    label: "Użytkownik",
    prefix: "",
    items: [
      {
        label: "Profil",
        href: "/profil",
        icon: UserIcon
      }
    ]
  },
  {
    label: "Moderator",
    prefix: "/moderator",
    roles: ["moderator"], // 👈 tylko moderator
    items: [
      {
        label: "Moje kręgi",
        href: "/moje-kregi",
        icon: CirclePile
      }
    ]
  },
  {
    label: "Partner",
    prefix: "/partner",
    roles: ["moderator"], // 👈 też tylko moderator
    items: [
      {
        label: "Płatności",
        href: "/platnosci",
        icon: Wallet
      }
    ]
  }
]

export const getUserMenu = (userRole: string) => {
  const roles = userRole
    .split(",")
    .map(r => r.trim())
    .filter(Boolean)

  return UserMenu.filter(section => {
    if (!section.roles) return true

    return section.roles.some(role => roles.includes(role))
  })
}