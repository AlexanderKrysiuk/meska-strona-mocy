"use client"

import { CreatePaymentForParticipationById } from "@/actions/stripe"
import Loader from "@/components/loader"
import { clientAuth } from "@/hooks/auth"
import { stripeConnect } from "@/lib/stripe-client"
import { formatedDate } from "@/utils/date"
import { PaymentQueries, UserQueries } from "@/utils/query"
import { faSackDollar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Form, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { Circle, Country, Meeting, Participation } from "@prisma/client"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { PaymentIntent } from "@stripe/stripe-js"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"

export const PayForParticipationModal = ({
    circle,
    meeting,
    country,
    participation,
} : {
    circle: Pick<Circle, "name">
    meeting: Pick<Meeting, "startTime" | "endTime">
    country: Pick<Country, "timeZone">
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
                onPress={onOpen}
                variant="light"
                radius="full"
                startContent={<FontAwesomeIcon icon={faSackDollar} size="xl"/>}
            />
        </Tooltip>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
            size="xl"
        >
            <ModalContent>
                <ModalHeader>
                    Opłać spotkanie kręgu {circle.name}, <br/>
                    z dnia {formatedDate(meeting.startTime, meeting.endTime, country.timeZone)} 
                </ModalHeader>
                <ModalBody>
                    <Tabs
                        variant="light"
                        fullWidth
                        defaultSelectedKey="stripe"
                    >
                        <Tab title="Płatność" key="stripe">
                            <StripePaymentTab
                                participation={participation}
                                onClose={onClose}
                            />
                        </Tab>
                        <Tab title="Portfel" key="wallet" isDisabled>

                        </Tab>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    </main>
}

const StripePaymentTab = ({
    participation,
    onClose
} : {
    participation: Pick<Participation,"id">
    onClose: () => void
}) => {
    const { resolvedTheme } = useTheme()

    const { data: stripePayment, isLoading, error } = useQuery({
        queryKey: [PaymentQueries.Participation, participation.id],
        queryFn: () => CreatePaymentForParticipationById(participation.id),
        enabled: !!participation.id,
        retry: false
    })

    const theme: "night" | "stripe" = resolvedTheme === "dark" ? "night" : "stripe"

    const appearance = {
        theme,
        variables: {
            colorPrimary: resolvedTheme === "dark" ? "#facc15" : "#f59e0b",
        }
    }

    if (isLoading) return <Loader/>

    if (error || !stripePayment) return <Alert
        color="danger"
    >
        {error instanceof Error ? error.message : "Nie można utworzyć płatności"} 
    </Alert>

    return <Elements 
        stripe={stripeConnect(stripePayment.stripeAccountId)} 
        options={{ clientSecret: stripePayment.client_secret, appearance}}
    >
        <StripePaymentForm
            paymentIntent={stripePayment}
            onClose={onClose}
        />
    </Elements>
}

const StripePaymentForm = ({
    paymentIntent,
    onClose
} : {
    paymentIntent: Pick<PaymentIntent, "amount" | "currency">
    onClose: () => void
}) => {
    const auth = clientAuth()
    const stripe = useStripe()
    const elements = useElements()

    const queryClient = useQueryClient()

    const { handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
        defaultValues: { stripeComplete: false }
    })

    const isValid = watch("stripeComplete")

    const onSubmit = async () => {
        if (!stripe || !elements) return

        const { error } = await elements.submit()
        if (error) return

        const result = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        })

        addToast({
            title: result.error ? "Płatność nieudana" : "Płatność udana",
            color: result.error ? "danger" : "success"
        })

        if (result.error) return

        queryClient.invalidateQueries({ queryKey: [UserQueries.Participations, auth?.id]})
        setTimeout(()=>{},3000)
        onClose() 
    }

    return <Form onSubmit={handleSubmit(onSubmit)}>
        <PaymentElement 
                options={{ layout: "tabs"}}
                className="w-full"
                onChange={(event) => setValue("stripeComplete", event.complete)}
        />
        <Button
            radius="sm"
            color="success"
            type="submit"
            fullWidth
            className="mt-4 text-white"
            startContent={<FontAwesomeIcon icon={faSackDollar}/>}
            isLoading={isSubmitting}
            isDisabled={isSubmitting || !isValid}
        >
            {isSubmitting ? "Przetwarzanie..." : `Zapłać ${paymentIntent.amount/100} ${paymentIntent.currency.toUpperCase()}`}
        </Button>
    </Form>
}