"use client"

import { CreatePaymentForMeetingByParticipationID } from "@/actions/stripe";
import { formatedDate } from "@/utils/date";
import { ModeratorQueries, PaymentQueries, UserQueries } from "@/utils/query";
import { faRotate, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Form, Modal, ModalBody, ModalContent, ModalHeader, NumberInput, Tab, Tabs, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { Balance, CircleMeeting, CircleMeetingParticipant, Country, Currency, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import Loader from "../loader";
import { stripePromise } from "@/lib/stripe-client";
import { useTheme } from "next-themes";
import { PaymentIntent } from "@stripe/stripe-js";
import { clientAuth } from "@/hooks/auth";
import { PaymentFromBalance, QueryGetSingleUserBalance } from "@/actions/balance";
import { SubmitHandler, useForm } from "react-hook-form";
import { OwnBalancePaymentSchema } from "@/schema/payment";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

export const PayForParticipantModal = ({
    participation,
    user,
    meeting,
    country,
    currency
} : {
    participation: CircleMeetingParticipant
    meeting: CircleMeeting
    country: Country
    user: Pick<User, "name">
    currency: Currency
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <main>
            <Tooltip
                color="warning"
                placement="top"
                content="Opłać spotkanie"
                className="text-white"
            >
                <Button
                    color="warning"
                    isIconOnly
                    onPress={onOpen}
                    variant="light"
                    radius="full"
                    isDisabled={participation.amountPaid >= meeting.price}
                >
                    <FontAwesomeIcon icon={faSackDollar} size="xl" />
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
                size="xl"
            >
                <ModalContent>
                    <ModalHeader>Opłać spotkanie</ModalHeader>
                    <PayForParticipantForm
                        participation={participation}
                        meeting={meeting}
                        country={country}
                        user={user}
                        onClose={onClose}
                        currency={currency}
                    />
                </ModalContent>
            </Modal>
        </main>
    );
};

const PayForParticipantForm = ({
    participation,
    meeting,
    country,
    user,
    onClose,
    currency
} : {
    participation: CircleMeetingParticipant
    meeting: CircleMeeting
    country: Country
    user: Pick<User, "name">
    onClose: () => void
    currency: Currency
}) => {
    const { resolvedTheme } = useTheme(); // "light" | "dark"
    const moderator = clientAuth()

    // Query Stripe – odpala się tylko gdy tab stripe jest wybrany
    const stripeQuery = useQuery({
      queryKey: [PaymentQueries.Participation, participation.id],
      queryFn: () => CreatePaymentForMeetingByParticipationID(participation.id),
    });

    // Query Balance – odpala się tylko gdy tab balance jest wybrany
    const balanceQuery = useQuery({
      queryKey: [UserQueries.Balance, moderator?.id],
      queryFn: () => QueryGetSingleUserBalance(moderator!.id, meeting.currencyId),
    });
  
    const theme: "night" | "stripe" = resolvedTheme === "dark" ? "night" : "stripe";
  
    const appearance = {
        theme,
        variables: {
            colorPrimary: resolvedTheme === "dark" ? "#facc15" : "#f59e0b",
        },
    };

    useEffect(() => {
      if (stripeQuery.data === null) {
        onClose();
      }
    }, [stripeQuery.data, onClose]);
    
    return (
        <ModalBody>
            <div className="mb-4">
                Czy jesteś pewien, że chcesz opłacić spotkanie z dnia{" "}
            <strong>
                {formatedDate(
                    meeting.startTime,
                    meeting.endTime,
                    country.timeZone,
                    "onlyDays",
                    country.locale
                )}
            </strong>{" "}
            dla kręgowca <strong>{user.name}</strong>
            </div>
            <Tabs variant="underlined" fullWidth>
                <Tab title="Płatność">
                  {stripeQuery.isLoading && <Loader/>}
                  {stripeQuery.isError && (
                    <Alert 
                      color="danger" 
                      title="Nie udało się wygenerować płatności."
                      endContent={
                        <Button
                          color="danger" 
                          startContent={<FontAwesomeIcon icon={faRotate}/>}
                          onPress={() => stripeQuery.refetch()}
                        >
                          Odśwież
                        </Button>
                      }
                    />
                  )}
                  {stripeQuery.data && <Elements stripe={stripePromise} options={{ clientSecret: stripeQuery.data.client_secret, appearance }}>
                    <StripeCheckoutForm 
                      payment={stripeQuery.data}
                      participation={participation}
                      onClose={onClose}    
                    />
                  </Elements>}
                </Tab>
                <Tab title="Z własnego konta">
                  {balanceQuery.isLoading && <Loader/>}
                  {balanceQuery.isError && (
                    <Alert 
                      color="danger" 
                      title="Nie udało się pobrać salda."
                      endContent={
                        <Button 
                          color="danger" 
                          startContent={<FontAwesomeIcon icon={faRotate}/>}
                          onPress={() => balanceQuery.refetch()}
                        >
                          Odśwież
                        </Button>
                      }
                    />
                  )}
                  <BalanceCheckoutFrom
                    participation={participation}
                    meeting={meeting}
                    meetingCurrency={currency}
                    balance={balanceQuery.data}
                    balanceCurrency={balanceQuery.data?.currency}
                  />
                </Tab>
            </Tabs>
        </ModalBody>
    );
};

const StripeCheckoutForm = ({
  payment,
  participation,
  onClose
}: {
  payment: Pick<PaymentIntent, "id" | "status" | "currency" | "amount" | "client_secret" >
  participation: CircleMeetingParticipant
  onClose: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) throw new Error("Stripe not loaded")

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              //name: payment.name,
              //email: payment.email
            },
            
          },
          return_url: "" // unikamy redirectu
          
        },
        redirect: "if_required",
        
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.paymentIntent
    },
    onSuccess: () => {
      addToast({
        title: "Płatność udana",
        color: "success"
      })
      queryClient.invalidateQueries({ 
        queryKey: [ModeratorQueries.MeetingParticipants, participation.meetingId] 
      })
      setTimeout(() => {
        }, 3000)
      onClose()
    },
    onError: (error) => {
      addToast({
        title: error.message || "Błąd płatności",
        color: "danger"
      })
    }
  })

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
    >
      <PaymentElement className="w-full" options={{ layout: "tabs" }} />
      <Button
        radius="sm"
        color="success"
        type="submit"
        fullWidth
        className="mt-4 text-white"
        startContent={<FontAwesomeIcon icon={faSackDollar}/>}
        isDisabled={mutation.isPending || !stripe || !elements || !payment}
        isLoading={mutation.isPending}
      >
        {mutation.isPending
          ? "Przetwarzanie..."
          : `Zapłać ${payment.amount/100} ${payment.currency.toUpperCase()}`}
      </Button>
    </Form>
  )
}

const BalanceCheckoutFrom = ({
  meeting,
  meetingCurrency,
  participation,
  balance,
  balanceCurrency
} : {
  meeting: CircleMeeting
  meetingCurrency: Currency
  participation: CircleMeetingParticipant
  balance?: Balance | null
  balanceCurrency?: Currency | null
}) => {
  const moderator = clientAuth()

  // const { data: balance, isLoading, error, refetch } = useQuery({
  //   queryKey: [UserQueries.Balance, moderator?.id],
  //   queryFn: () => QueryGetSingleUserBalance(moderator!.id, meeting.currencyId),
  //   enabled: !!moderator?.id
  // });

  type FormFields = z.infer<typeof OwnBalancePaymentSchema>

  
  const { handleSubmit, setError, setValue, formState: { errors, isSubmitting, isValid }} = useForm<FormFields>({
    resolver: zodResolver(OwnBalancePaymentSchema),
    mode: "all",
    defaultValues: {
      balanceID: balance?.id,
      participationID: participation.id,
    }
  })
  const queryClient = useQueryClient()
  
  const submit: SubmitHandler<FormFields> = async(data) => {
    const result = await PaymentFromBalance(data)

    addToast({
      title: result.message,
      color: result.success ? "success" : "danger"
    })
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: [UserQueries.Balance, moderator?.id]});
      queryClient.invalidateQueries({ queryKey: [ModeratorQueries.MeetingParticipants, participation.meetingId]});
      queryClient.invalidateQueries({ queryKey: [PaymentQueries.Participation, participation.id]})
    } else {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormFields, { type: "manual", message });
        });
      }
    }
  }
  
  // if (isLoading) return <Loader />;
  
  // if (error) return (
  //   <ModalBody>
  //     <Alert 
  //       color="danger" 
  //       title="Nie udało się wygenerować płatności."
  //       endContent={
  //         <Button
  //           color="danger"
  //           startContent={<FontAwesomeIcon icon={faRotate}/>}
  //           onPress={()=>refetch()}
  //         >
  //           Odśwież
  //          </Button>
  //       }
  //     />
  //   </ModalBody>
  // );
  

  return <main className="space-y-4">
    <div>
    Dostępne środki: <strong className="text-warning">{balance?.amount || "0"} {balanceCurrency?.code || meetingCurrency.code}</strong>
    </div>
    <Form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <NumberInput
        label="Kwota, którą chcesz wpłacić"
        labelPlacement="outside"
        variant="bordered"
        placeholder="150"
        minValue={0}
        maxValue={Math.min(meeting.price - participation.amountPaid, balance?.amount ?? 0)}
        onValueChange={(value) => {setValue("amout", value, {shouldValidate:true})}}
        isClearable
        isDisabled={!balance || isSubmitting}
        isInvalid={!!errors.amout}
        errorMessage={errors.amout?.message}
      />
      <Button
        fullWidth
        type="submit"
        color="success"
        className="text-white"
        startContent={isSubmitting ? undefined : <FontAwesomeIcon icon={faSackDollar}/>}
        isDisabled={isSubmitting || !isValid}
        isLoading={isSubmitting}
      >
        Zapłać
      </Button>
    </Form>
    {/* <pre>
      {JSON.stringify(watch(),null,2)}<br/>
      {JSON.stringify(balance,null,2)}
    </pre> */}
  </main>

}


// const StripeCheckoutForm = ({
//     payment,
//     participation,
//     onClose
// } : {
//     payment: any
//     participation: CircleMeetingParticipant
//     onClose: () => void
// }) => {
//     const stripe = useStripe()
//     const elements = useElements()
//     const {handleSubmit, formState: {isSubmitting}} = useForm()

//     const queryClient = useQueryClient()

//     const onSubmit: SubmitHandler<{}> = async () => {
//         if (!stripe || !elements) return

//         const result = await stripe.confirmPayment({
//             elements,
//             confirmParams: {
//                 payment_method_data: {
//                     billing_details: {
//                         name: payment.name,
//                         email: payment.email
//                     },
//                 },
//                 return_url: ""
//             },
//             redirect: "if_required"
//         })

//         if (result.error) {
//             addToast({
//                 title: result.error.message,
//                 color: "danger"
//             })
//         } else {
//             addToast({
//                 title: "Płatność udana",
//                 color: "success"
//             })
//             queryClient.invalidateQueries({ queryKey: [PaymentQueries.Participation, participation.id]})
//             onClose()
//         }
//     }

//     return (
//         <Form onSubmit={handleSubmit(onSubmit)}>
//             <PaymentElement className="w-full" options={{ layout: "tabs" }}/>
//                 <Button
//                     radius="sm"
//                     color="success"
//                     type="submit"
//                     fullWidth 
//                     className="mt-4 text-white"
//                     startContent={<FontAwesomeIcon icon={faSackDollar}/>}
//                     isDisabled={isSubmitting}
//                     isLoading={isSubmitting}
//                 >
//                     {isSubmitting ? `Przetwarzanie...` : `Zapłać ${payment.amount/100} ${payment.currency}`}
//                 </Button>
//         </Form>
//     )
// }