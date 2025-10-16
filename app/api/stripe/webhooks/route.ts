//app/api/stripe/webhooks/route
import { GetMembershipByUserIdAndCircleId } from "@/actions/membership"
import { GetParticipationByID } from "@/actions/participation"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe-server"
import { StripeWebhook } from "@/utils/stripe-webhook"
import { Currency } from "@prisma/client"

export async function POST(req: Request) {
    const payload = await req.text()
    const sig = req.headers.get("stripe-signature")!
    let event

    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (error) {
        console.error(error)
        return new Response("Stripe Webhook error", { status: 400 })
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object
        const { type } = paymentIntent.metadata
        if (type === StripeWebhook.Participations) {
            const { participationsIds, membershipID } = paymentIntent.metadata
            let ids: string[] = []
            try {
                ids = JSON.parse(participationsIds)
            } catch(error) {
                console.error("❌ Błąd parsowania participationIds:", participationsIds)
                return new Response("Invalid metadata", { status: 400 })
            }

            await prisma.$transaction(async (tx) => {
                let remainingAmount = paymentIntent.amount_received
                const currency = paymentIntent.currency.toUpperCase() as Currency

                for (const id of ids) {
                    const participation = await GetParticipationByID(id)
                    if (!participation) continue

                    const { meeting } = participation

                    const alreadyPaid = participation.payments
                        .filter((p) => p.currency === meeting.currency)
                        .reduce((sum, p) => sum + p.amount, 0)

                    const remainingForMeeting = meeting.price - alreadyPaid
                    if (remainingForMeeting <= 0) continue

                    const paidNow = Math.min(remainingForMeeting, remainingAmount / 100); // przeliczenie z groszy
                    
                    if (paidNow > 0) {
                        await tx.participationPayment.create({
                            data: {
                                participationId: id,
                                amount: Math.round(paidNow),
                                currency: currency,
                                stripePaymentId: paymentIntent.id


                            }
                        })
                        remainingAmount -= paidNow * 100;
                    }
                    if (remainingAmount <= 0) break;
                }

                if (remainingAmount > 0) {
                    await tx.membershipBalance.create({
                        data: {
                            membershipId: paymentIntent.metadata.membershipID,
                            amount: Math.round(remainingAmount/100),
                            currency: currency,
                            stripePaymentId: paymentIntent.id
                        }
                    })
                }
            })


        }
    }
    return Response.json({ received: true });
}