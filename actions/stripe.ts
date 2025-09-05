"use server"

import { stripe } from "@/lib/stripe-server"
import { GetParticipationByID } from "./participant"
import { MeetingParticipantStatus } from "@prisma/client"

export const CreatePaymentForMeetingByParticipationID = async (participationID: string) => {
    const participation = await GetParticipationByID(participationID)
    //if (!participation) return { success: false, message: "Brak danych o uczestnictwie" }
    if (!participation) throw new Error("Brak danych o uczestnictwie")

    if (participation.status !== MeetingParticipantStatus.Active) throw new Error ("użytkownika nie będzie na tym spotkaniu")

    const amount = (participation.meeting.price - participation.amountPaid)*100

    //if (amount <= 0) return { success: false, message: "Spotkanie opłacone" }
    if (amount <= 0) return null
    
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: participation.meeting.currency.code.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            metadata: {
                participationId: participation.id}
        })
        return {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret!,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
        }    
    } catch (error) {
        console.error(error)
        throw new Error ("Błąd tworzenia płatności")
    }

    // ✅ Zwracamy tylko plain object z tym, czego potrzebujemy
    // return {
    //     success: true,
    //     clientSecret: paymentIntent.client_secret,
    //     amount: paymentIntent.amount,
    //     currency: paymentIntent.currency,
    //     name: participation.user.name,
    //     email: participation.user.email
    // }
}