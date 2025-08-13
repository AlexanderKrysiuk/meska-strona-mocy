"use client"

import { User } from "@prisma/client";

const CircleMembersWrapper = ({
    users
} : {
    users: Partial<User>[]
}) => {
    return (
        <pre>
            {JSON.stringify(users,null,2)}
        </pre>
    );
}
 
export default CircleMembersWrapper;