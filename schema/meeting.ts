import { isSameDay, isBeforeDay } from '@/utils/date';
import * as z from 'zod'

const email = z.string().email({ message: "Podaj poprawny e-mail" }).transform((val) => val.toLowerCase());
const meetingId = z.string().uuid()
const circleId = z.string().uuid().nonempty("Wybierz krąg")

const street = z.string({required_error: "Pole nie może być puste", invalid_type_error: "Pole nie może być puste"}).min(3, "Nazwa ulicy musi mieć co najmniej 3 znaki").trim().max(255, "Adres jest zbyt długi");

const cityId = z.string().min(1,"Wybierz miasto")

const price = z.coerce.number({required_error: "Pole nie może być puste",invalid_type_error: "Pole nie moze być puste"}).refine(price => price === 0 || price >= 10, {message: "spotkanie może być darmowe lub płatne co najmniej 10 zł",});

const date = z.date({ required_error: "Wybierz datę" })


const startTime = z.coerce.date({ message: "Nieprawidłowy format daty i godziny" })

const endTime = z.coerce.date({ message: "Nieprawidłowy format daty i godziny" })

// początek jutrzejszego dnia
const tomorrow = new Date();
tomorrow.setHours(0, 0, 0, 0);
tomorrow.setDate(tomorrow.getDate() + 1);

export const CreateMeetingSchema = (unavailableDates: Date[]) => {
    return z
        .object({
            circleId,
            date,
            startTime,
            endTime,
            street,
            cityId,
            price,
        })
        .superRefine((data, ctx) => {
            // 🔹 minimalna data to jutro
            if (isBeforeDay(data.date, tomorrow)) {
            ctx.addIssue({
                code: "custom",
                message: "Najwcześniej możesz umówić spotkanie na jutro",
                path: ["date"],
            });
        }
  
        // 🔹 walidacja niedostępnych dat
        if (unavailableDates.some(d => isSameDay(d, data.date))) {
          ctx.addIssue({
            code: "custom",
            message: "W tym dniu masz już inne spotkanie",
            path: ["date"],
          });
        }
  
        // 🔹 czas zakończenia vs rozpoczęcia
        if (data.endTime <= data.startTime) {
          ctx.addIssue({
            code: "custom",
            message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
            path: ["endTime"],
          });
        }
  
        if (data.startTime >= data.endTime) {
          ctx.addIssue({
            code: "custom",
            message: "Czas rozpoczęcia musi wystąpić przed czasem zakończenia",
            path: ["startTime"],
          });
        }
      });
  };

// export const CreateMeetingSchema = (unavailableDates: Date[]) => {
//     return z.object({
//         circleId,
//         date,
//         startTime,
//         endTime,
//         street,
//         cityId,
//         price,
//     }).superRefine((data, ctx) => {
//         if (data.date < tomorrow) {
//             ctx.addIssue({
//                 code: "custom",
//                 message: "Najwcześniej możesz umówić spotkanie na jutro",
//                 path: ["date"],
//             });
//         }
//         // 🔹 walidacja: niedostępne daty
//         if (unavailableDates.some(d => 
//             d.getFullYear() === data.date.getFullYear() &&
//             d.getMonth() === data.date.getMonth() &&
//             d.getDate() === data.date.getDate()
//         )) {
//             ctx.addIssue({
//                 code: "custom",
//                 message: "W tym dniu masz już inne spotkanie",
//                 path: ["date"],
//             });
//         }
//         // jeśli endTime jest przed startTime
//         if (data.endTime <= data.startTime) {
//             ctx.addIssue({
//                 code: "custom",
//                 message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
//                 path: ["endTime"],
//             });
//         }
//         // jeśli startTime jest po endTime
//         if (data.startTime >= data.endTime) {
//             ctx.addIssue({
//                 code: "custom",
//                 message: "Czas rozpoczęcia musi wystąpić przed czasem zakończenia",
//                 path: ["startTime"],
//             });
//         }
//     });
// }

export const EditMeetingSchema = (unavailableDates: Date[], originalStartTime: Date) => {
    const minDate = originalStartTime > tomorrow ? tomorrow : originalStartTime;
  
    return z
      .object({
        meetingId,
        circleId,
        date,
        startTime,
        endTime,
        street,
        cityId,
        price,
      })
      .superRefine((data, ctx) => {
        // 🔹 minimalna data
        if (isBeforeDay(data.date, minDate)) {
          ctx.addIssue({
            code: "custom",
            message: `Najwcześniej możesz umówić spotkanie na ${minDate.toLocaleDateString("pl-PL")}`,
            path: ["date"],
          });
        }
  
        // 🔹 walidacja niedostępnych dat (ignorujemy aktualną datę spotkania)
        if (
          unavailableDates.some(
            (d) => isSameDay(d, data.date) && !isSameDay(d, originalStartTime)
          )
        ) {
          ctx.addIssue({
            code: "custom",
            message: "W tym dniu masz już inne spotkanie",
            path: ["date"],
          });
        }
  
        // 🔹 czas zakończenia vs rozpoczęcia
        if (data.endTime <= data.startTime) {
          ctx.addIssue({
            code: "custom",
            message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
            path: ["endTime"],
          });
        }
  
        if (data.startTime >= data.endTime) {
          ctx.addIssue({
            code: "custom",
            message: "Czas rozpoczęcia musi wystąpić przed czasem zakończenia",
            path: ["startTime"],
          });
        }
      });
  };
  

// export const EditMeetingSchema = (unavailableDates: Date[], originalStartTime: Date) => {
//     const minDate = originalStartTime > tomorrow ? originalStartTime : tomorrow;
  
//     return z
//       .object({
//         meetingId,
//         circleId,
//         date,
//         startTime,
//         endTime,
//         street,
//         cityId,
//         price,
//       })
//       .superRefine((data, ctx) => {
//         // 🔹 minimalna data nie zależy od data.startTime w formularzu
//         if (
//           data.date.getFullYear() < minDate.getFullYear() ||
//           (data.date.getFullYear() === minDate.getFullYear() &&
//             (data.date.getMonth() < minDate.getMonth() ||
//               (data.date.getMonth() === minDate.getMonth() &&
//                 data.date.getDate() < minDate.getDate())))
//         ) {
//           ctx.addIssue({
//             code: "custom",
//             message: `Najwcześniej możesz umówić spotkanie na ${minDate.toLocaleDateString("pl-PL")}`,
//             path: ["date"],
//           });
//         }
  
//         // 🔹 walidacja niedostępnych dat (ignorujemy aktualną datę spotkania)
//         if (
//           unavailableDates.some(
//             (d) =>
//               d.getFullYear() === data.date.getFullYear() &&
//               d.getMonth() === data.date.getMonth() &&
//               d.getDate() === data.date.getDate() &&
//               !(d.getFullYear() === originalStartTime.getFullYear() &&
//                 d.getMonth() === originalStartTime.getMonth() &&
//                 d.getDate() === originalStartTime.getDate())
//           )
//         ) {
//           ctx.addIssue({
//             code: "custom",
//             message: "W tym dniu masz już inne spotkanie",
//             path: ["date"],
//           });
//         }
  
//         // 🔹 czas zakończenia vs rozpoczęcia
//         if (data.endTime <= data.startTime) {
//           ctx.addIssue({
//             code: "custom",
//             message: "Czas zakończenia musi wystąpić po czasie rozpoczęcia",
//             path: ["endTime"],
//           });
//         }
  
//         if (data.startTime >= data.endTime) {
//           ctx.addIssue({
//             code: "custom",
//             message: "Czas rozpoczęcia musi wystąpić przed czasem zakończenia",
//             path: ["startTime"],
//           });
//         }
//       });
//   };

export const RegisterToMeetingSchema = z.object({
    email,
    circleId,
    meetingId
})

export const CompleteMeetingSchema = z.object({
    meetingId
})
