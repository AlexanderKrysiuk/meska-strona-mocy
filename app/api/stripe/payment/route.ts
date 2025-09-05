// app/api/webhook/route.ts
import { stripe } from "@/lib/stripe-server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
    const participationId = paymentIntent.metadata.participationId
    console.log(paymentIntent.amount)

    await prisma.circleMeetingParticipant.update({
      where: { id: participationId },
      data: { amountPaid: paymentIntent.amount / 100 },
    })
  }

  return new Response("Success", { status: 200 })
}
