"use server"

import { auth } from "@/auth"
import { headers } from "next/headers"
import { del, put } from "@vercel/blob"

export const UpsertAvatarAction = async (file: Blob) => {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: "Brak zalogowanego użytkownika" }

    const path = `avatars/${session.user.id}}`

    // 🔥 USUŃ STARY AVATAR – TYLKO JEŚLI JEST NASZ
    if (session.user.image?.includes("vercel-storage.com")) {
        try {
            await del(session.user.image)
        } catch (error) {
            console.warn("⚠️ Nie udało się usunąć starego avatara", error)
        }
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const upload = await put(path, buffer, {
        access: "public",
        contentType: "image/png",
        allowOverwrite: true,
        addRandomSuffix: true
    })

    await auth.api.updateUser({
        headers: await headers(),
        body: { image: upload.url },
    })

    return { url: upload.url }
}
