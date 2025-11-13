// //app/api/stripe/webhooks/route
// import { GetParticipationsByIds } from "@/actions/participation"
// import { prisma } from "@/lib/prisma"
// import { stripe } from "@/lib/stripe-server"
// import { StripeWebhook } from "@/utils/stripe-webhook"
// import { Currency } from "@prisma/client"

export async function POST() {
//     const payload = await req.text()
//     const sig = req.headers.get("stripe-signature")!
//     let event

//     try {
//         event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
//     } catch (error) {
//         console.error(error)
//         return new Response("Stripe Webhook error", { status: 400 })
//     }

//     console.log("Stripe event received:", event.type, event.id);


//     if (event.type === "application_fee.created") {
//         console.log("Metadata:", event.data.object.metadata);
//         const paymentIntent = event.data.object
//         const { type } = paymentIntent.metadata
//         if (type === StripeWebhook.Participations) {
//             const { participationsIds, membershipID } = paymentIntent.metadata
//             let ids: string[] = []
//             try {
//                 ids = JSON.parse(participationsIds)
//             } catch(error) {
//                 console.error("❌ Błąd parsowania participationIds:", participationsIds)
//                 return new Response("Invalid metadata", { status: 400 })
//             }

//             await prisma.$transaction(async (tx) => {
//                 let remainingAmount = paymentIntent.amount_received
//                 const currency = paymentIntent.currency.toUpperCase() as Currency

//                 const participations = await GetParticipationsByIds(ids)
//                 for (const participation of participations) {
//                     const { meeting } = participation

//                     const alreadyPaid = participation.payments
//                         .filter((p) => p.currency === meeting.currency)
//                         .reduce((sum, p) => sum + p.amount * 100, 0)

//                     const remainingForMeeting = Math.round(meeting.price * 100) - alreadyPaid;
//                     if (remainingForMeeting <= 0) continue;

//                     const paidNow = Math.min(remainingForMeeting, remainingAmount);

//                     if (paidNow > 0) {
//                         await tx.participationPayment.create({
//                             data: {
//                                 participationId: participation.id,
//                                 amount: Math.round(paidNow / 100), // zapis w złotych
//                                 currency: currency,
//                                 stripePaymentId: paymentIntent.id
//                             }
//                         });
//                         remainingAmount -= paidNow;
//                     }

//                     if (remainingAmount <= 0) break;
//                 }

//                 if (remainingAmount > 0 && membershipID) {
//                     await tx.membershipBalance.create({
//                         data: {
//                             membershipId: membershipID,
//                             amount: Math.round(remainingAmount / 100),
//                             currency: currency,
//                             stripePaymentId: paymentIntent.id
//                         }
//                     });
//                 }
//             })
//         }
//     }
//     return Response.json({ received: true });
}