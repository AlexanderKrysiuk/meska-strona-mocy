export const GetVerifyURL = (
    token: string,
    email: string
) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${encodeURIComponent(token)}&identifier=${encodeURIComponent(email)}`
}