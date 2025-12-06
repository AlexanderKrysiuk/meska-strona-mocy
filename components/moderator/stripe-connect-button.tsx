"use client";

//import { ConnectStripeAccount } from "@/actions/stripe";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { addToast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
//import { useRouter } from "next/navigation";
//import { faStripeS } from '@fortawesome/free-brands-svg-icons'
import { UserQueries } from "@/utils/query";
import { clientAuth } from "@/hooks/auth";
import { GetUserByID } from "@/actions/user";


export const StripeConnectButton = () => {
    const auth = clientAuth()
    //const router = useRouter()

    const { data: user } = useQuery({
        queryKey: [UserQueries.User, auth?.id],
        queryFn: () => GetUserByID(auth!.id),
        enabled: !!auth?.id
    })

    // const { mutate, isPending } = useMutation({
    //     mutationFn: ConnectStripeAccount,
    //     onSuccess: (stripeConnect: string) => {
    //         router.push(stripeConnect)
    //     },
    //     onError: () => addToast({
    //         color: "danger",
    //         title: "Wystąpił błąd"
    //     })
    // })

    if (!user) return

    // return <Button
    //     color="success"
    //     size="lg"
    //     startContent={isPending ? undefined : <FontAwesomeIcon icon={faStripeS}/>}
    //     isLoading={isPending || isLoading}
    //     isDisabled={isPending || isLoading || !!user?.stripeAccountId}
    //     onPress={() => mutate()}
    // >
    //     {user?.stripeAccountId ? `Masz już konto stripe` : `Połącz konto Stripe`}
    // </Button>
}