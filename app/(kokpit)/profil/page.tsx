"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarChangeDialog } from "@/components/user/avatar-change-dialog"
import { useSession } from "@/lib/auth-client"
import { Upload, User } from "lucide-react"

//app/kokpit/profil/page.tsx
const ProfilePage = () => {
    const { data: session } = useSession()
    return     <main className="w-full flex justify-center p-4">
        <AvatarChangeDialog/>
        <pre>
            {JSON.stringify(session?.user,null ,2)}
        </pre>
    </main>
}
export default ProfilePage