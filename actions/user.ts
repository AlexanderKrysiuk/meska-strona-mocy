import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schema/user";
import z from "zod";

export async function RegisterUser(values: z.infer<typeof RegisterSchema>) {
    const parsed = RegisterSchema.safeParse(values)

    if (!parsed.success) return { error: parsed.error.format }

    const { name, email, phone } = parsed.data

    await prisma.user.create({
        data: {
            name: name,
            email: email,
            phone: phone
        }
    })
}