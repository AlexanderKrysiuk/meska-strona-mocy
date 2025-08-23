"use client"

import { CompleteMeeting } from "@/actions/meeting"
import { CompleteMeetingSchema } from "@/schema/meeting"
import { faCalendarCheck, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, CircleMeeting, City, Country, Region } from "@prisma/client"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const CompleteMeetingModal = ({
    meeting,
    circle,
    countries,
    regions,
    cities
} : {
    meeting: CircleMeeting
    circle: Circle
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()
    const date = new Date()

    type FormFields = z.infer<typeof CompleteMeetingSchema>

    const { handleSubmit, formState: {isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(CompleteMeetingSchema),
        defaultValues: {
            meetingId: meeting.id
        }
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await CompleteMeeting(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })

        if (result.success) {
            router.refresh()
            onClose()
        }
    }

    const city = cities.find(c => c.id === meeting.cityId)
    const region = regions.find(r => r.id === city?.regionId)
    const country = countries.find(c => c.id === region?.countryId)

    const formattedDate = new Intl.DateTimeFormat(country?.locale, {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(meeting.startTime))

    const formattedStartTime = new Intl.DateTimeFormat(country?.locale, {
        hour: "2-digit",
        minute: "2-digit"
    }).format(meeting.startTime)

    const formattedEndTime = new Intl.DateTimeFormat(country?.locale, {
        hour: "2-digit",
        minute: "2-digit"
    }).format(meeting.endTime)

    return (
        <main>
            <Tooltip
                color="success"
                placement="top"
                content="Zakończ spotkanie"
            >
                <Button
                    color="success"
                    isIconOnly
                    radius="full"
                    variant="light"
                    startContent={<FontAwesomeIcon icon={faCalendarCheck} size="lg"/>}
                    onPress={onOpen}
                    isDisabled={meeting.endTime > date}
                />
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
            >
                <ModalContent>
                    <ModalHeader>Zakończenie spotkania</ModalHeader>
                    <ModalBody>
                        <div>
                            Czy na pewno chcesz zakończyć spotkanie kręgu:{" "}
                            <strong>{circle.name}</strong>?
                        </div>
                        <div>
                            Data: <strong>{formattedDate}</strong>
                            <br />
                            Godzina: <strong>{formattedStartTime} – {formattedEndTime}</strong>
                        </div>
                        <div className="text-danger font-semibold">
                            Zakończonego spotkania nie będzie można edytować. Kończ tylko spotkania, które już się faktycznie odbyły.
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Form onSubmit={handleSubmit(submit)}>
                            <Button
                                color="primary"
                                startContent={isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                                type="submit"
                                isDisabled={isSubmitting}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Zakończ"}
                            </Button>
                        </Form>
                        <Button
                            color="danger"
                            startContent={<FontAwesomeIcon icon={faXmark}/>}
                            onPress={onClose}
                            isDisabled={isSubmitting}
                        >
                            Anuluj
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </main>
    )
}

export default CompleteMeetingModal;