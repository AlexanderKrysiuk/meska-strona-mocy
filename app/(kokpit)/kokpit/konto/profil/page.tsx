"use client"

import Loader from "@/components/loader";
import EditAvatarModal from "@/components/user/edit-avatar-modal";
//import EditUserForm from "@/components/user/profile/edit-user-form";
import { useSession } from "next-auth/react";

const ProfilePage = () => {
    const { status } = useSession()

    if (status === "loading") return <Loader/>

    return <main className="p-4 space-y-4">
        <EditAvatarModal/>
    </main>
}
 
export default ProfilePage;