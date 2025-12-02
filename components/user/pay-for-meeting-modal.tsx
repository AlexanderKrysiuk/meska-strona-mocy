"use client"

// import { CreatePaymentForMeetingByParticipationID } from "@/actions/stripe"
//import { clientAuth } from "@/hooks/auth"
//import { formatedDate } from "@/utils/date"
import { PaymentQueries } from "@/utils/query"
import { faSackDollar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, Tab, Tabs, Tooltip, useDisclosure } from "@heroui/react"
import { Participation } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
//import { useTheme } from "next-themes"
import Loader from "../loader"
//import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
// import { stripePromise } from "@/lib/stripe-client"
//import { useForm } from "react-hook-form"
//import { PaymentIntent } from "@stripe/stripe-js"

export const PayForMeetingButton = ({
    // meeting,
    // country,
    //circle,
    participation
} : {
    // meeting: Pick<Meeting, "startTime" | "endTime">
    // country: Pick<Country, "timeZone">
    //circle: Pick<Circle, "name">
    participation: Pick<Participation, "id">
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return <main>
        <Tooltip
            color="warning"
            placement="top"
            content="Opłać spotkanie"
            className="text-white"
        >
            <Button
                color="warning"
                isIconOnly
                onPressUp={onOpen}
                variant="light"
                radius="full"
            >
                <FontAwesomeIcon icon={faSackDollar} size="xl"/>
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
                {/* <ModalHeader>Opłać spotkanie kręgu {circle.name} z dnia {formatedDate(meeting.startTime, meeting.endTime, country.timeZone, "onlyDays")}</ModalHeader> */}
                <ModalBody>
                    <Tabs 
                        variant="light"
                        fullWidth
                        defaultSelectedKey="stripe"
                    >
                        <Tab title="Płatność" key="stripe">
                            <StripePaymentTab
                                participation={participation}
                                //onClose={onClose}
                            />
                        </Tab>
                        <Tab title="Portfel" key="wallet" isDisabled>
456
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter/>
            </ModalContent>
        </Modal>
    </main>
}

const StripePaymentTab = ({
    participation,
    //onClose
} : {
    participation: Pick<Participation, "id">
    //onClose: () => void
}) => {
    //const { resolvedTheme } = useTheme()

    const { data: stripePayment, isLoading } = useQuery({
        queryKey: [PaymentQueries.Participation, participation.id],
        // queryFn: () => CreatePaymentForMeetingByParticipationID(participation.id)
    })

    //const theme: "night" | "stripe" = resolvedTheme === "dark" ? "night" : "stripe" 

    // const appearance = {
    //     theme,
    //     variables: {
    //         colorPrimary: resolvedTheme === "dark" ? "#facc15" : "#f59e0b",
    //     }
    // }
     
    if (isLoading) return <Loader/>

    if (!stripePayment) return null

    // return <Elements stripe={stripePromise} options={{ clientSecret: stripePayment.client_secret, appearance}}>
    //     <StripePaymentForm
    //         paymentIntent={stripePayment}
    //         onClose={onClose}
    //     />
    // </Elements>
}

// const StripePaymentForm = ({
//     paymentIntent,
//     onClose
// } : {
//     paymentIntent: Pick<PaymentIntent, "amount" | "currency">
//     onClose: () => void
// }) => {
//     const auth = clientAuth()
//     const stripe = useStripe()
//     const elements = useElements()

//     const queryClient = useQueryClient()

//     const { handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
//         defaultValues: { stripeComplete: false }
//     })

//     const isValid = watch("stripeComplete")

//     const onSubmit = async () => {
//         if (!stripe || !elements) return

//         const { error } = await elements.submit()
//         if (error) return

//         const result = await stripe.confirmPayment({
//             elements,
//             redirect: "if_required"
//         })

//         addToast({
//             title: result.error ? "Płatność nieudana" : "Płatność udana",
//             color: result.error ? "danger" : "success"
//         })

//         if (result.error) return

//         setTimeout(()=>{},3000)
//         queryClient.invalidateQueries({ queryKey: [PaymentQueries.UnpaidMeetings, auth?.id]})
//         onClose() 
//     }

//     return <Form onSubmit={handleSubmit(onSubmit)}>
//         <PaymentElement 
//                 options={{ layout: "tabs"}}
//                 className="w-full"
//                 onChange={(event) => setValue("stripeComplete", event.complete)}
//         />
//         <Button
//             radius="sm"
//             color="success"
//             type="submit"
//             fullWidth
//             className="mt-4 text-white"
//             startContent={<FontAwesomeIcon icon={faSackDollar}/>}
//             isLoading={isSubmitting}
//             isDisabled={isSubmitting || !isValid}
//         >
//             {isSubmitting ? "Przetwarzanie..." : `Zapłać ${paymentIntent.amount/100} ${paymentIntent.currency.toUpperCase()}`}
//         </Button>
//     </Form>
// }