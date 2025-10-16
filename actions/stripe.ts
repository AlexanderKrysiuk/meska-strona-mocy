"use server"

import { stripe } from "@/lib/stripe-server"
import { GetParticipationByID, GetTotalParticipationPaid } from "./participation"
import { ParticipationStatus, SubscriptionPeriod } from "@prisma/client"
import { ServerAuth } from "./auth"
import { GetUserByID } from "./user"
import { prisma } from "@/lib/prisma"
import { StripeWebhook } from "@/utils/stripe-webhook"
import { GetMembershipByUserIdAndCircleId } from "./membership"

export const GetAccountPayments = async (accountID: string) => {
    if (!accountID) throw new Error("Brak identyfikatora")

    const payments = await stripe.paymentIntents.list(
        { limit: 20 },
        { stripeAccount: accountID }
    )

    return payments.data
}

export const CreatePaymentForParticipationByID = async (participationID: string, membershipID: string) => {
    const participation = await GetParticipationByID(participationID);
    if (!participation) throw new Error("Brak danych o uczestnictwie");
    if (participation.status !== ParticipationStatus.Active) throw new Error("Użytkownik nie będzie na tym spotkaniu");
  
    if (!participation.meeting.moderator.stripeAccountId) throw new Error("Nie można wygenerować płatności");
    //const account = await stripe.accounts.retrieve(participation.meeting.moderator.stripeAccountId);
    //console.log("TYP KONTA:",account.type)
    //console.log(account.charges_enabled); // true / false
    //console.log(account.payouts_enabled); 

    const totalPaid = await GetTotalParticipationPaid({
        participationId: participation.id,
        currency: participation.meeting.currency
    })

    const amount = (participation.meeting.price - totalPaid) * 100;
    if (amount <= 0) return null; // Spotkanie już opłacone
  
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: participation.meeting.currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            application_fee_amount: Math.round(amount * 0.03),
            // transfer_data: {
            //     destination: participation.meeting.moderator.stripeAccountId,
            //   },
            metadata: { 
                type: StripeWebhook.Participations,
                participationIds: JSON.stringify([participation.id]),
                membershipID: membershipID
            },
        },
        {
            stripeAccount: participation.meeting.moderator.stripeAccountId
        });

        // console.log("CLIENT SECRET:", paymentIntent.client_secret)
        
        return {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret!,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            stripeAccountId: participation.meeting.moderator.stripeAccountId
        };
    } catch (error) {
        console.error(error);
        throw new Error("Błąd tworzenia płatności");
    }
};  

export const ConnectStripeAccount = async () => {
    const auth = await ServerAuth()

    if (auth.roles.length <= 0) throw new Error ("Brak uprawnień")
        
    return stripe.oauth.authorizeUrl({
        response_type: "code",
        client_id: process.env.STRIPE_CLIENT_ID!,
        scope: "read_write",
        redirect_uri: `http://${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/callback`,
        state: auth.id
    })
}

export const CreateModeratorSubscriptionCheckout = async (type: SubscriptionPeriod) => {
    const auth = await ServerAuth()

    const user = await GetUserByID(auth.id)
    if (!user) throw new Error("Brak danych o użytkowniku")
    
    const customerId = user.stripeCustomerId ?? (await CreateStripeCustomer(user.id, user.email))

    let priceID
    switch (type) {
        case SubscriptionPeriod.Monthly:
            priceID = process.env.STRIPE_SUBSCRIPTION_MODERATOR_MONTHLY
            break
        case SubscriptionPeriod.Yearly:
            priceID = process.env.STRIPE_SUBSCRIPTION_MODERATOR_YEARLY
            break
    }

    // const session = await stripe.checkout.sessions.create({
    //     mode: "subscription",
    //     customer: user.stripeCustomerId,
    //     line_items: [
    //         {
    //             price: priceID,
    //             quantity: 1
    //         }
    //     ],
        
    // })
}

const CreateStripeCustomer = async(userId: string, email:string) => {
    const customer = await stripe.customers.create({ email })
    await prisma.user.update({
        where: {id: userId},
        data: {stripeCustomerId: customer.id}
    })
    return customer.id
} 

export const CheckModeratorTransfers = async (moderatorId: string) => {
    const moderator = await prisma.user.findUnique({
        where: { id: moderatorId },
        select: { stripeAccountId: true },
    });
  
    if (!moderator?.stripeAccountId) throw new Error("Moderator nie połączył konta Stripe");
  
    const account = await stripe.accounts.retrieve(moderator.stripeAccountId);
    // Bezpieczne sprawdzenie, jeśli capabilities undefined
    const transfersActive = account.capabilities?.transfers === "active";  
    return transfersActive;
  }
  

  async function showModeratorCommissionStatus(moderatorStripeAccountId: string) {
    const startOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
    const endOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() / 1000);
  
    const transfers = await stripe.transfers.list({
      destination: moderatorStripeAccountId,
      created: { gte: startOfMonth, lte: endOfMonth },
      limit: 100,
    });
  
    let totalTaken = 0;
  
    console.log(`Transferry od moderatora ${moderatorStripeAccountId} w tym miesiącu:\n`);
  
    transfers.data.forEach(t => {
      const amountZl = t.amount / 100;
      totalTaken += amountZl;
      console.log(`- Transfer: ${amountZl} ${t.currency} | z charge: ${t.source_transaction} | utworzony: ${new Date(t.created * 1000).toLocaleString()}`);
    });
  
    const monthlyLimit = 200;
    const remaining = Math.max(monthlyLimit - totalTaken, 0);
  
    console.log(`\nSuma pobranych prowizji: ${totalTaken.toFixed(2)} zł`);
    console.log(`Pozostało do limitu 200 zł: ${remaining.toFixed(2)} zł`);
  }

export const GetStripeAccountStatus = async (stripeAccountId: string) => {
    const account = await stripe.accounts.retrieve(stripeAccountId)

    return {
        charges: account.charges_enabled
    }
}