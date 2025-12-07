"use server"

import { prisma } from "@/lib/prisma";
import { CheckLoginReturnUser } from "./auth"
import { put, del } from '@vercel/blob';

export const QueryUploadAvatar = async (formData: FormData) => {

    const user = await CheckLoginReturnUser();
    if (!user) throw new Error("Musisz być zalogowany.");


    const file = formData.get("file") as File;
    if (!file) throw new Error("Nie wybrano pliku.");
    

    try {
        const prefix = "avatars";
        const fileExtension = file.name.split(".").pop();
        const newFileName = `${prefix}/${crypto.randomUUID()}.${fileExtension}`;

        //const newFileName = `${prefix}/${uuidv4()}.${fileExtension}`;

        const newBlob = await put(newFileName, file, { access: 'public' });

        await prisma.user.update({
            where: { id: user.id },
            data: { image: newBlob.url }
        });

        // Usuwanie starego pliku: operacja nieblokująca.
        // Wykonujemy ją asynchronicznie i ignorujemy błędy,
        // ponieważ sukces tego kroku nie jest kluczowy dla odpowiedzi.
        // Usuwanie starego pliku tylko jeśli jest z naszego blob storage
    if (user.image) {
        const isOurAvatar = user.image.includes("/avatars/") && user.image.includes("vercel-storage.com");

        if (isOurAvatar) {
            del(user.image).catch(err => {
                console.warn("Błąd przy usuwaniu starego awatara:", err);
            });
        }
    }

        return { message: "Zmieniono Avatara.", image: newBlob.url };

    } catch (error) {
        console.error(error);
        throw new Error("Wystąpił nieznany błąd podczas przesyłania awatara.");
    }
}