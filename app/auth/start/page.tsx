"use server"

import { CheckLoginReturnUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import StartPageWrapper from "./wrapper";

const StartPage = async () => {
    const user = await CheckLoginReturnUser()

    if (user) redirect("/")
    
    return <StartPageWrapper/>
}
 
export default StartPage;