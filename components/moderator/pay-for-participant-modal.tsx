"use client"

import { CreatePaymentForMeetingByParticipationID } from "@/actions/stripe";
import { formatedDate } from "@/utils/date";
import { ModeratorQueries, PaymentQueries } from "@/utils/query";
import { faRotate, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Form, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { CircleMeeting, CircleMeetingParticipant, Country, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import Loader from "../loader";
import { stripePromise } from "@/lib/stripe-client";
import { useTheme } from "next-themes";
import { PaymentIntent } from "@stripe/stripe-js";

export const PayForParticipantModal = ({
    participation,
    user,
    meeting,
    country
} : {
    participation: CircleMeetingParticipant
    meeting: CircleMeeting
    country: Country
    user: Pick<User, "name">
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
    onClose
} : {
    participation: CircleMeetingParticipant
    meeting: CircleMeeting
    country: Country
    user: Pick<User, "name">
    onClose: () => void
}) => {
    const { resolvedTheme } = useTheme(); // "light" | "dark"
  
    const { data: payment, isLoading, error, refetch } = useQuery({
        queryKey: [PaymentQueries.Participation, participation.id],
        queryFn: () => CreatePaymentForMeetingByParticipationID(participation.id),
    });
  
    if (isLoading) return <Loader />;
  
    if (error) return (
        <ModalBody>
            <Alert 
                color="danger" 
                title="Nie udało się wygenerować płatności."
                endContent={
                    <Button
                        color="danger"
                        startContent={<FontAwesomeIcon icon={faRotate}/>}
                        onPress={()=>refetch()}
                    >
                        Odśwież
                    </Button>
                }
            />
        </ModalBody>
    );

    if (!payment) return null
    
    const theme: "night" | "stripe" = resolvedTheme === "dark" ? "night" : "stripe";
  
    const appearance = {
        theme,
        variables: {
            colorPrimary: resolvedTheme === "dark" ? "#facc15" : "#f59e0b",
        },
    
    };
        
    const options = {
        clientSecret: payment.client_secret,
        appearance,
        
    };

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
            <Elements stripe={stripePromise} options={options}>
                <StripeCheckoutForm 
                    payment={payment}
                    participation={participation}
                    onClose={onClose}    
                />
            </Elements>
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
    setTimeout(() => {
  }, 3000)
      queryClient.invalidateQueries({ 
        queryKey: [ModeratorQueries.MeetingParticipants, participation.meetingId] 
      })
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
        isDisabled={mutation.isPending || !payment}
        isLoading={mutation.isPending}
      >
        {mutation.isPending
          ? "Przetwarzanie..."
          : `Zapłać ${payment.amount/100} ${payment.currency}`}
      </Button>
    </Form>
  )
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