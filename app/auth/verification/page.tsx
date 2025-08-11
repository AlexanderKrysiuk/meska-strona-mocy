import { GetVerificationToken } from "@/actions/tokens"
import { NewPasswordCard, TokenNotValid } from "@/components/auth/verification"

const VerificationPage = async ({
    searchParams
} : {
    searchParams : Promise<{ token: string}>
}) => {
    const { token } = await searchParams

    const verificationToken = await GetVerificationToken(token)

    if (!verificationToken || verificationToken.expires <= new Date()) return <TokenNotValid/>

    return <NewPasswordCard
        id={verificationToken.id}
        email={verificationToken.email}
        expires={verificationToken.expires}
    />
}
export default VerificationPage;