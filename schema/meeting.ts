import * as z from 'zod'

const email = z.string().email({ message: "Podaj poprawny e-mail" }).transform((val) => val.toLowerCase());
const meetingId = z.string().uuid()
const circleId = z.string().uuid().nonempty("Wybierz krąg")
const street = z.string({
    required_error: "Pole nie może być puste",
    invalid_type_error: "Pole nie może być puste"
  }).min(3, "Nazwa ulicy musi mieć co najmniej 3 znaki").trim().max(255, "Adres jest zbyt długi");
const cityId = z.string().min(1,"Wybierz miasto")


const price = z.coerce.number({
    required_error: "Pole nie może być puste",
    invalid_type_error: "Pole nie moze być puste"
}).refine(price => price === 0 || price >= 10, {
    message: "spotkanie może być darmowe lub płatne co najmniej 10 zł",
  });

//const startTime = z.string().datetime({message: "Nieprawidłowy format daty i godziny"})
//    .refine((startTime) => new Date(startTime) > new Date(), { message: "Czas rozpoczęcia nie może być w przeszłości" })
const date = z.date({ required_error: "Wybierz datę" })
const startTime = z.coerce.date({ message: "Nieprawidłowy format daty i godziny" })
const endTime = z.coerce.date({ message: "Nieprawidłowy format daty i godziny" })

// export const CreateMeetingSchema = z.object({
//     circleId,
//     date,
//     startTime,
//     endTime,
//     street,
//     cityId,
//     price,
// }).refine((data) => data.startTime > new Date(), {
//     path: ["startTime"],
//     message: "Czas rozpoczęcia nie może być w przeszłości",
// }).refine((data) => !data.endTime || data.endTime > data.startTime, {
//     path: ["endTime"],
//     message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
// })

// początek jutrzejszego dnia
const tomorrow = new Date();
tomorrow.setHours(0, 0, 0, 0);
tomorrow.setDate(tomorrow.getDate() + 1);

export const CreateMeetingSchema = (unavailableDates: Date[]) => {


return z.object({
  circleId: z.string(),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  street: z.string(),
  cityId: z.string(),
  price: z.number(),
}).superRefine((data, ctx) => {
    if (data.date < tomorrow) {
        ctx.addIssue({
            code: "custom",
            message: "Najwcześniej możesz umówić spotkanie na jutro",
            path: ["date"],
        });
    }
     // 🔹 walidacja: niedostępne daty
     if (unavailableDates.some(d => 
        d.getFullYear() === data.date.getFullYear() &&
        d.getMonth() === data.date.getMonth() &&
        d.getDate() === data.date.getDate()
    )) {
        ctx.addIssue({
            code: "custom",
            message: "W tym dniu masz już inne spotkanie",
            path: ["date"],
        });
    }
    // jeśli endTime jest przed startTime
    if (data.endTime <= data.startTime) {
        ctx.addIssue({
            code: "custom",
            message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
            path: ["endTime"],
        });
    }
    // jeśli startTime jest po endTime
    if (data.startTime >= data.endTime) {
        ctx.addIssue({
            code: "custom",
            message: "Czas rozpoczęcia musi wystąpić przed czasem zakończenia",
            path: ["startTime"],
        });
    }
});
}

export const EditMeetingSchema = z.object({
    meetingId,
    startTime,
    endTime,
    street,
    cityId,
    price
// }).refine((data) => data.startTime > new Date(), {
//     path: ["startTime"],
//     message: "Czas rozpoczęcia nie może być w przeszłości",
}).refine((data) => !data.endTime || data.endTime > data.startTime, {
    path: ["endTime"],
    message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
})

export const RegisterToMeetingSchema = z.object({
    email,
    circleId,
    meetingId
})

export const CompleteMeetingSchema = z.object({
    meetingId
})
