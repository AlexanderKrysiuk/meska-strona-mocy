// "use server"

// import { prisma } from "@/lib/prisma"
// import { OwnBalancePaymentSchema } from "@/schema/payment"
// import { z } from "zod"
// import { GetParticipationByID } from "./participation"
// import { Currency } from "@prisma/client"

// export const QueryGetSingleUserBalance = async (userID: string, currency: Currency) => {
//     try {
//         return await prisma.balance.findUnique({
//             where: { userId_currency: {
//                 userId: userID,
//                 currency: currency
//             }}
//         })
//     } catch (error) {
//         console.error(error)
//         throw new Error("Błąd połączenia z bazą danych")
//     }
// }

// export const GetBalanceByID = async (ID: string) => {
//     try {
//         return await prisma.balance.findUnique({
//             where: { id: ID }
//         })
//     } catch (error) {
//         console.error(error)
//         return null
//     }
// }

// export const PaymentFromBalance = async (data: z.infer<typeof OwnBalancePaymentSchema>) => {
//     if (data.amout <= 0) return { success: false, message: "Kwota musi być większa niż 0", fieldErrors: { amount: "Kwota musi być większa niż 0" } };
    
//     const balance = await GetBalanceByID(data.balanceID)
//     if (!balance) return {success: false, message: "Brak informacji o dostępnych środkach"}

//     if (balance.amount < data.amout) return {success: false, message: "Nie masz wystarczającej ilości środków"}
    
//     const participation = await GetParticipationByID(data.participationID)
//     if (!participation) return {success: false, message: "Brak informacji o uczesnictwie"}

//     const remainingToPay = participation.meeting.price - participation.amountPaid;

//     const paying = Math.min(data.amout, remainingToPay);

//     try {
//         await prisma.$transaction([
//             prisma.balance.update({
//                 where: { id: balance.id },
//                 data: { amount: { decrement: paying }}
//             }),
//             prisma.participation.update({
//                 where: { id: participation.id },
//                 data: { amountPaid: { increment: paying }}
//             })
//         ])
//         return {
//             success: true,
//             message: "Przeprowadzono operację pomyślnie"
//         }
//     } catch (error) {
//         console.error(error)
//         return {
//             success: false,
//             message: "Błąd połączenia z bazą danych"
//         }
//     }
// }