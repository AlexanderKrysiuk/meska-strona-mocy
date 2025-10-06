// app/api/stripe/callback/route.ts
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) return new Response("Brak code/state", { status: 400 });

  // Wymiana code na token na stripe_user_id
  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });
  const connected_account_id = response.stripe_user_id;

  // Zapis do bazy
  await prisma.user.update({
    where: { id: state },
    data: { stripeAccountId: connected_account_id },
  });

  // Przekierowanie użytkownika na frontend
  return NextResponse.redirect("http://localhost:3000/partner/platnosci");
}
