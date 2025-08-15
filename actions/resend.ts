"use server"

import ResetPasswordEmail from "@/components/emails/ResetPassword"
import WelcomeEmail from "@/components/emails/Welcome"
import WelcomeToCircleEmail from "@/components/emails/WelcomeToCircle"
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
            message: "Nie wysłano e-maila weryfikacyjnego"
        }
    }
}

export const SendResetPasswordEmail = async (token: VerificationToken) => {
    try {
        await resend.emails.send({
            from: "info@meska-strona-mocy.pl",
            to: token.email,
            subject: "Resetowanie hasła - Męska Strona Mocy",
            react: ResetPasswordEmail({token})
        })
        return {
            success: true,
            message: "Wysłano e-mail resetujący hasło"
        }
    } catch(error) {
        console.error("SendResetPasswordEmail", error)
        return {
            success: false,
            message: "Nie wysłano e-maila resetującego hasło"
        }
    }
}

export const SendWelcomeToCircleEmail = async (email:string, circleName:string, name?:string) => {
    try {
        await resend.emails.send({
            from: "info@meska-strona-mocy.pl",
            to: email,
            subject: `Witamy w kręgu - ${circleName}`,
            react: WelcomeToCircleEmail({name, circleName})
        })
        return {
            success: true,
            message: "Wysłano e-mail zapraszający do kręgu"
        }
    } catch (error) {
        console.error("SendWelcomeToCircleEmail", error)
        return {
            success: false,
            message: "Nie wysłano maila zapraszającego"
        }
    }
}