"use client"

import { QueryGetUserByID } from "@/actions/user";
import Loader from "@/components/loader";
import EditAvatarModal from "@/components/user/edit-avatar-modal";
import EditUserForm from "@/components/user/edit-user-form";
import { clientAuth } from "@/hooks/auth";
import { UserQueries } from "@/utils/query";
import { Role } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

const ProfilePage = () => {
    const auth = clientAuth()

    const { data: user, isLoading } = useQuery({
        queryKey: [UserQueries.User, auth?.id],
        queryFn: () => QueryGetUserByID(auth!.id),
        enabled: !!auth?.id
    })

    if (isLoading || !user) return <Loader/>

    return <main className="p-4 space-y-4">
        <EditAvatarModal
            user={user}
        />
        {auth?.roles.includes(Role.Moderator) && <EditUserForm user={user}/>
        }
    </main>
}
 
export default ProfilePage;