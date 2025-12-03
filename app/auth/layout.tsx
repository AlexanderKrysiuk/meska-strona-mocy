"use server"

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AuthLayout = async ({ 
    children 
} : { 
    children: ReactNode 
}) => {
    const user = await auth()
    
    if (user) redirect("/")

    return ( 
        <main>
            {children}
        </main>
        
    );
}
 
export default AuthLayout;