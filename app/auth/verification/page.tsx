import { GenerateVerificationToken } from "@/actions/auth"
import { NewPasswordCard, TokenExpired, TokenNotFound } from "@/components/auth/verification"
import { sendVerificationEmail } from "@/lib/nodemailer"
import { prisma } from "@/lib/prisma"

const VerificationPage = async ({
    searchParams
} : {
    searchParams : Promise<{ token: string}>
}) => {
    const { token } = await searchParams

    const verificationToken = await prisma.verificationToken.findFirst({
        where: { id: token }
    })

    if (!verificationToken) return <TokenNotFound/>

    if (verificationToken.expires <= new Date()) {
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        })
        const newToken = await GenerateVerificationToken(verificationToken.email)
        await sendVerificationEmail(newToken)
        return <TokenExpired/>
    }

    return <NewPasswordCard
        id={verificationToken.id}
        email={verificationToken.email}
        expires={verificationToken.expires}
    />
}
export default VerificationPage;