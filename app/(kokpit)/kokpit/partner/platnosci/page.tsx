"use client"

// import { ConnectStripeAccount } from "@/actions/stripe";
// import { GetUserByID } from "@/actions/user";
// import Loader from "@/components/loader";
// import { StripeConnectButton } from "@/components/moderator/stripe-connect-button";
// import StripeChargesButton from "@/components/stripe/stripe-charges-button";
// import { clientAuth } from "@/hooks/auth";
// import { UserQueries } from "@/utils/query";
// import { faStripeS } from "@fortawesome/free-brands-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Button, addToast } from "@heroui/react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";

const PaymentsPage = () => {
    // const auth = clientAuth()
    // const router = useRouter()

    // const { data: user, isLoading } = useQuery({
    //     queryKey: [UserQueries.User, auth?.id],
    //     queryFn: () => GetUserByID(auth!.id),
    //     enabled: !!auth?.id
    // })

    // // const { data: payments, isLoading: isLoadingPayments } = useQuery({
    // //     queryKey: ["stripePayments", user?.stripeAccountId],
    // //     queryFn: async () => {
    // //         if (!user?.stripeAccountId) return []; // nic nie rób, gdy brak ID
    // //         return await GetAccountPayments(user.stripeAccountId);
    // //     },
    // //     enabled: !!user?.stripeAccountId
    // // });

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

    // if (isLoading) return <Loader/>

    // return ( 
    //     <main className="p-4 space-y-4 flex flex-grow">
    //         <StripeConnectButton/>
    //         {user?.stripeAccountId ? (
    //             <div className="w-full">
    //                 <StripeChargesButton 
    //                     stripeAccountId={user.stripeAccountId}
    //                 />
    //                 {/* <Table
    //                     shadow="sm"
    //                 >
    //                     <TableHeader>
    //                         <TableColumn>Data</TableColumn>
    //                         <TableColumn>Kwota</TableColumn>
    //                         <TableColumn>Status</TableColumn>
    //                         <TableColumn>Metoda</TableColumn>                        
    //                     </TableHeader>
    //                     <TableBody
    //                         items={payments ?? []}
    //                         emptyContent={"Brak płatności"}
    //                         isLoading={isLoadingPayments}
    //                     >
    //                         {(item) => (
    //                             <TableRow key={item.id}>
    //                                 <TableCell>{new Date(item.created * 1000).toLocaleString("pl-PL")}</TableCell>
    //                                 <TableCell>{(item.amount / 100).toFixed(2)} {item.currency.toUpperCase()}</TableCell>
    //                                 <TableCell>
    //                                     <span className={
    //                                         item.status === "succeeded"
    //                                         ? "text-green-500"
    //                                         : item.status === "processing"
    //                                         ? "text-yellow-500"
    //                                         : "text-red-500"
    //                                     }>
    //                                         {item.status}
    //                                     </span>
    //                                 </TableCell>
    //                                 <TableCell>{item.payment_method_types?.join(", ")}</TableCell>
    //                             </TableRow>
    //                         )}
    //                     </TableBody>
    //                 </Table>
    //                 {JSON.stringify(payments,null,2)} */}
    //             </div>
    //         ) : (
    //             <div className="w-full flex justify-center items-center py-10">
    //                 <Button
    //                     color="success"
    //                     size="lg"
    //                     isDisabled={isPending || !!user?.stripeAccountId}
    //                     onPress={() => mutate()}
    //                     startContent={<FontAwesomeIcon icon={faStripeS}/>}
    //                     className="text-white"
    //                 >
    //                     Zintegruj konto Stripe
    //                 </Button>
    //             </div>
    //         )}
    //         {/* <pre>
    //             {JSON.stringify(user,null,2)}
    //         </pre> */}
    //     </main>
    //  );
}
 
export default PaymentsPage;