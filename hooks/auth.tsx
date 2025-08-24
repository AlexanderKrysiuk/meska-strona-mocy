"use client"
import { useSession } from "next-auth/react"
export const clientAuth = () => {
    const {data} = useSession();
    return data?.user
}