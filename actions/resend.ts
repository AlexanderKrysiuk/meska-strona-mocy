"use server"

import WelcomeEmail from "@/components/emails/Welcome"
import { resend } from "@/lib/resend"
import { VerificationToken } from "@prisma/client"

export const SendRegisterNewUserEmail = async (token: VerificationToken, name?: string) => {
    try {
        await resend.emails.send({
            from: "info@meska-strona-mocy.pl",
            to: token.email,
            subject: "Witamy - Męska Strona Mocy",
            react: WelcomeEmail({token, name})
        })
        return {
            success: true,
            message: "Wysłano e-mail weryfikacyjny"
        }
    } catch(error) {
        console.error("SendRegisterNewUserEmail", error)
        return {
            success: false,
            message: "Nie wysłano maila weryfikacyjnego"
        }
    }
}