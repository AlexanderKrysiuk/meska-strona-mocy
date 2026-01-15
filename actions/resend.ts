import { render } from "@react-email/components";
import { ReactElement } from "react";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function SendEmail(
    to: string,
    subject: string,
    react: ReactElement
) {
    const html = await render(react)
    try {
        await resend.emails.send({
            from: "info@meska-strona-mocy.pl",
            to,
            subject,
            react
        })
    } catch (error) {
        console.error(error)
    }
}