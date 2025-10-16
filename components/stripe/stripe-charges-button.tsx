"use client"

import { GetStripeAccountStatus } from "@/actions/stripe";
import { clientAuth } from "@/hooks/auth";
import { StripeQueries } from "@/utils/query";
import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

const StripeChargesButton = ({
    stripeAccountId
} : {
    stripeAccountId: string
}) => {
    const auth = clientAuth()

    const { data: charges } = useQuery({
        queryKey: [StripeQueries.Charges, auth?.id],
        queryFn: () => GetStripeAccountStatus(stripeAccountId),
        enabled: !!stripeAccountId
    })

    return <Button>
        {charges ? "Tak" : "Nie"}
        {JSON.stringify(charges,null,2)}
    </Button>
}
 
export default StripeChargesButton;