// hooks/useAuthUser.ts
import { GetUserByID } from "@/actions/user";
import { UserQueries } from "@/utils/query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
    const queryClient = useQueryClient()

    const cachedUser = queryClient.getQueryData([UserQueries.User])

    const { data } = useSession()
    
    const query = useQuery({
        queryKey: [UserQueries.User],
        queryFn: () => GetUserByID(data?.user.id!),
        enabled: !!data?.user.id
    })

    return cachedUser ?? query.data
}

// export const useCurrentUser = () => {
//   const { data: session, status } = useSession();
//   return {
//     user: session?.user,
//     isLoading: status === "loading",
//     isAuthenticated: !!session?.user,
//   };
// };
