//lib/stripe-client.ts
import { loadStripe } from "@stripe/stripe-js";

export const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)
export const stripeConnect = (stripeAccountId: string) => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!, { stripeAccount: stripeAccountId });