import * as z from 'zod'

const email = z.string().email({ message: "Podaj poprawny e-mail" }).transform((val) => val.toLowerCase());
const meetingId = z.string().uuid()
const groupId = z.string().uuid()
const street = z.string().min(3, "Nazwa ulicy musi mieć co najmniej 3 znaki").trim().max(255, "Adres jest zbyt długi");
const cityId = z.string().min(1, "Wybierz miasto")


const price = z.coerce.number().refine(price => price === 0 || price >= 10, {
    message: "spotkanie może być darmowe lub płatne co najmniej 10 zł",
  });

//const startTime = z.string().datetime({message: "Nieprawidłowy format daty i godziny"})
//    .refine((startTime) => new Date(startTime) > new Date(), { message: "Czas rozpoczęcia nie może być w przeszłości" })
const startTime = z.coerce.date({ message: "Nieprawidłowy format daty i godziny" })
const endTime = z.coerce.date({ message: "Nieprawidłowy format daty i godziny" })

export const CreateMeetingSchema = z.object({
    groupId,
    startTime,
    endTime,
    street,
    cityId,
    price
}).refine((data) => data.startTime > new Date(), {
    path: ["startTime"],
    message: "Czas rozpoczęcia nie może być w przeszłości",
}).refine((data) => !data.endTime || data.endTime > data.startTime, {
    path: ["endTime"],
    message: "Czas zakończenia musi być po czasie rozpoczęcia",
});

export const RegisterToMeetingSchema = z.object({
    email,
    groupId,
    meetingId
})
