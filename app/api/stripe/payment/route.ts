// app/api/webhook/route.ts
import { stripe } from "@/lib/stripe-server"
//import { PrismaClient } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const payload = await req.text()
  const sig = req.headers.get("stripe-signature")!
  let event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.log(error)
    return new Response("Webhook error", { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object
    //const participationId = paymentIntent.metadata.participationId
    console.log(paymentIntent.amount)

    // const businessInfo = await prisma.businessInfo.findFirst({
    //   orderBy: { createdAt: "desc"}
    // })


    await prisma.participation.update({
      where: { id: paymentIntent.metadata.participationId },
      data: { amountPaid: { increment: paymentIntent.amount / 100 } },
    })
    
    // await prisma.transaction.create({
    //   data: {
    //     userId: participation.userId,
    //     amount: paymentIntent.amount/100,
    //     currencyId: paymentIntent.currency
    //   }
    // })

  }

  return new Response("Success", { status: 200 })
}
