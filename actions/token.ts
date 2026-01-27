"use server"

import crypto from "crypto"
import { SendEmail } from "./resend"
import { TokenResetEmail } from "@/emails/Token-Reset"
import { GetVerifyURL } from "@/helpers/token"
import prisma from "@/lib/prisma"

export async function GenerateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 1000 * 60 * 60)

  await prisma.verificationToken.deleteMany({ 
    where: { identifier: email }
  })

  return await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: token,
      expires: expires
    }
  })
}

export const VerifyToken = async (
  email: string,
  token: string,
) => {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: {
      identifier: email,
      token: token,
    }} 
  })

  if (!record) {
    return {
      success: false, 
      data: "Nie znaleziono tokenu",
    }
  }

  if (record.expires < new Date()) {
    const newToken = await GenerateVerificationToken(email)

    const resetURL = GetVerifyURL(newToken.token, newToken.identifier)

    await SendEmail({
      to: email,
      subject: "Twój token został zresetowany",
      react: TokenResetEmail({
        resetURL,
      }),
    })

    return {
      success: false,
      data: "Token wygasł, wysłano nowy",
    }
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  return {
    success: true,
    data: record.identifier,
  }
}