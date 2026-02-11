"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AvatarChangeDialog } from "@/components/user/avatar-change-dialog"
import UpdatePersonalDataForm from "@/components/user/update-personal-data-form"
import { useSession } from "@/auth/auth-client"
import { Upload, User } from "lucide-react"

//app/kokpit/profil/page.tsx
const ProfilePage = () => {
    const { data: session } = useSession()
    return     <main className="w-full flex flex-col p-4 items-center space-y-4">
        <AvatarChangeDialog/>
        <Separator/>
        <UpdatePersonalDataForm/>
        <pre>
            {JSON.stringify(session?.user,null ,2)}
        </pre>
    </main>
}
export default ProfilePage