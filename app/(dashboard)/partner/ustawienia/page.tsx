"use client"

import { CreateOrUpdateExpressAccount } from "@/actions/stripe";
import Loader from "@/components/loader";
import { addToast } from "@heroui/react";
import { loadConnectAndInitialize } from "@stripe/connect-js/pure";
import { ConnectAccountManagement, ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { setTimeout } from "timers";

const OnBoardingPage = () => {

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["stripeOnboarding"],
        queryFn: CreateOrUpdateExpressAccount,
      });
    
      const [stripeConnectInstance, setStripeConnectInstance] = useState<any | null>(null);
    
      useEffect(() => {
        const init = async () => {
          if (!data?.clientSecret) return;
    
          // inicjalizacja Connect dopiero po stronie klienta
          const instance = await loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
            fetchClientSecret: async () => data.clientSecret,
            appearance: {
                overlays: "dialog"
            }
          });
    
          setStripeConnectInstance(instance);
        };
    
        init();
      }, [data]);

      if (isLoading || !stripeConnectInstance) return <Loader />;
    
      return (
        <main className="p-4 flex flex-grow">
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              {data?.needsOnboarding ? 
                  <ConnectAccountOnboarding onExit={() => {
                    addToast({
                      title: "Konfiguracja ukończona",
                      color: "success",
                    })
                    setTimeout(()=>{},3000)
                    refetch()
                  }} />
                : 
                  <ConnectAccountManagement/>}
            </ConnectComponentsProvider>    
        </main>
      );

    // const { data, isLoading } = useQuery({
    //     queryKey: ["stripeOnboarding"],
    //     queryFn: async () => {
    //       // Wywołanie Server Action po stronie klienta
    //       return await CreateOrUpdateExpressAccount();
    //     },
    //   });
    
    //   const [stripeConnectInstance, setStripeConnectInstance] = useState<any | null>(null);
    
    //   useEffect(() => {
    //     const init = async () => {
    //       if (!data?.clientSecret) return;
      
    //       const instance = await loadConnectAndInitialize({
    //         publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    //         fetchClientSecret: async () => data.clientSecret,
    //       });
      
    //       setStripeConnectInstance(instance);
    //     };
      
    //     init();
    //   }, [data]);
    
    //   if (isLoading || !stripeConnectInstance) return <Loader />;
    
    //   return (
    //     <main>
    //         {JSON.stringify(stripeConnectInstance,null,2)}
    //     <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
    //       <ConnectAccountOnboarding onExit={() => {}} />
    //     </ConnectComponentsProvider>
    //     </main>
    //   );
    // //const data = await CreateOrUpdateExpressAccount()

    // //return <StripeOnboardingComponent clientSecret={data.clientSecret}/>

    // const [stripeConnectInstance] = useState(() => {
    //     const fetchClientSecret = async () => {
    //         const response = await CreateOrUpdateExpressAccount()
    //         return response.clientSecret
    //     }

    //     return loadConnectAndInitialize({
    //             publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    //             fetchClientSecret: fetchClientSecret
    //         })
    //     })
  
    // return (
    //    <main className="p-4">
    //      <ConnectComponentsProvider connectInstance={stripeConnectInstance} >
    //        <ConnectAccountOnboarding 
    //          onExit={()=>{}}
    //        />
    //      </ConnectComponentsProvider>
    //    </main>
    //  );
  };
 
export default OnBoardingPage;