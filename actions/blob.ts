"use server"

import { prisma } from "@/lib/prisma";
import { CheckLoginReturnUser } from "./auth"
import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from "uuid";

export const QueryUploadAvatar = async (formData: FormData) => {
    const user = await CheckLoginReturnUser();
    if (!user) throw new Error("Musisz być zalogowany.");


    const file = formData.get("file") as File;
    if (!file) throw new Error("Nie wybrano pliku.");
    

    try {
        const prefix = "avatars";
        const fileExtension = file.name.split(".").pop();
        const newFileName = `${prefix}/${uuidv4()}.${fileExtension}`;

        const newBlob = await put(newFileName, file, { access: 'public' });

        await prisma.user.update({
            where: { id: user.id },
            data: { image: newBlob.url }
        });

        // Usuwanie starego pliku: operacja nieblokująca.
        // Wykonujemy ją asynchronicznie i ignorujemy błędy,
        // ponieważ sukces tego kroku nie jest kluczowy dla odpowiedzi.
        if (user.image && user.image.startsWith("https://meska-strona-mocy.pl/vercel.app/blobs/")) {
            // del przyjmuje pełny URL pliku
            del(user.image).catch(error => {
                console.error("Błąd podczas usuwania starego awatara:", error);
            });
        }

        return { message: "Zmieniono Avatara." };

    } catch (error) {
        console.error(error);
        throw new Error("Wystąpił nieznany błąd podczas przesyłania awatara.");
    }
}