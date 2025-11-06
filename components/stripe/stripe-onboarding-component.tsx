"use client"

import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useState } from "react";

const StripeOnboardingComponent = ({
    clientSecret 
} : {
    clientSecret: string
}) => {
    const [stripeConnectInstance] = useState(() => {
        return loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
            fetchClientSecret: async () => clientSecret
        })
    })

    return <ConnectComponentsProvider connectInstance={stripeConnectInstance} >
    <ConnectAccountOnboarding 
      onExit={()=>{}}
    />
  </ConnectComponentsProvider>;
}
 
export default StripeOnboardingComponent;