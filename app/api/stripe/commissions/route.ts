// app/api/webhook/commissions/route.ts
import { stripe } from "@/lib/stripe-server"

export async function POST(req: Request) {
    const payload = await req.text()
    const sig = req.headers.get("stripe-signature")!

    let event
    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_COMMISSION_SECRET!)
    } catch (err) {
        console.log("Webhook error:", err)
        return new Response("Webhook error", { status: 400 })
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as any
        const participationId = paymentIntent.metadata.participationId

        // --- 1️⃣ ustalenie konta moderatora ---
        const moderatorStripeAccountId = paymentIntent.transfer_data?.destination
        if (!moderatorStripeAccountId) return new Response("Brak konta moderatora", { status: 400 })

        const paymentAmount = paymentIntent.amount / 100 // w zł
        const currency = paymentIntent.currency

        // --- 2️⃣ pobranie sumy prowizji w bieżącym miesiącu ---
        const startOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)
        const endOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() / 1000)

        const transfers = await stripe.transfers.list({
            destination: moderatorStripeAccountId,
            created: { gte: startOfMonth, lte: endOfMonth },
            //limit: 100,
        })

        const alreadyTaken = transfers.data.reduce((sum, t) => sum + t.amount, 0) / 100 // w zł

        // --- 3️⃣ obliczenie prowizji dla tej płatności ---
        const remainingLimit = Math.max(200 - alreadyTaken, 0)
        const commission = Math.min(paymentAmount * 0.1, remainingLimit)

        if (commission > 0) {
            // --- 4️⃣ transfer prowizji na Twoje konto (Stripe Connect) ---
            await stripe.transfers.create({
                amount: Math.round(commission * 100), // w groszach
                currency,
                destination: moderatorStripeAccountId,
                source_transaction: paymentIntent.charges.data[0].id,
            },
            {
                idempotencyKey: `commission-${paymentIntent.id}`, // <-- tu, jako drugi argument
            })
            console.log(`Pobrano prowizję ${commission} zł od płatności ${paymentAmount} zł (participationId: ${participationId})`)
        } else {
            console.log(`Limit miesięczny 200 zł osiągnięty – brak pobrania prowizji (participationId: ${participationId})`)
        }
    }

    return new Response("Success", { status: 200 })
}