import React from 'react'
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail ({
    to,
    subject,
    react
} : {
    to: string,
    subject: string,
    react: React.ReactElement
}) {
    try {
        return resend.emails.send({
            from: "Męska Strona Mocy <info@meska-strona-mocy.pl>",
            to,
            subject,
            react
        })
    } catch (error) {
        console.error(error)
    }
}