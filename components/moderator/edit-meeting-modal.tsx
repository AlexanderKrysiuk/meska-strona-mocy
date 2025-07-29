"use client"

import { EditMeetingSchema } from "@/schema/meeting"
import { faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Divider, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getLocalTimeZone, parseDate, today } from "@internationalized/date"
import { Group, GroupMeeting } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditMeetingModal = ({
    meeting,
    meetings,
    group
} : {
    meeting: GroupMeeting
    meetings: GroupMeeting[]
    group: Group
}) => {
    const router = useRouter()

    type FormFields = z.infer<typeof EditMeetingSchema>

    const [date, setDate] = useState<DateValue | null>(parseDate(meeting.startTime.toISOString().split("T")[0]))    

    const { handleSubmit, watch, formState: { isSubmitting, errors, isValid, isDirty } } = useForm<FormFields>({
        resolver: zodResolver(EditMeetingSchema),
        mode: "all",
        defaultValues: {
            meetingId: meeting.id,
            startTime: meeting.startTime,
            endTime: meeting.endTime
        }
    })

    const disabledDates = useMemo(() => {
        return meetings
          .filter(m => m.id !== meeting.id) // <- pomijamy edytowane spotkanie
          .map(m => parseDate(new Date(m.startTime).toISOString().split("T")[0]))
      }, [meetings, meeting.id])

    const isDateUnavailable = (date: DateValue) => {
        return disabledDates.some(disabled =>
            date.compare(disabled) === 0
        )
    }

    const submit: SubmitHandler<FormFields> = async (data) => {
        console.log(data)

        addToast({
            title: "Roboczy",
            color: "primary"
        })
        router.refresh()
    }

    const {isOpen, onOpen, onClose} = useDisclosure()

    return (
        <main>
            <Button
                color="primary"
                isIconOnly
                onPress={onOpen}
                variant="light"
                radius="full"
            >
                <FontAwesomeIcon icon={faPen}/>
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <ModalHeader>Spotkanie Grupy: {group.name}</ModalHeader>
                    <Divider/>
                        {JSON.stringify(watch(),null,2)}
                    <Divider/>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <DatePicker
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                value={date}
                                isDateUnavailable={isDateUnavailable}
                                minValue={today(getLocalTimeZone()).add({days: 1})}
                                onChange={(date) => {
                                    setDate(date)
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.startTime}
                                errorMessage={errors.startTime?.message}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting || !isValid || !isDirty} 
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Zmień dane spotkania"}
                            </Button>
                        </ModalFooter>
                    </Form>
                    <Divider/>
                    A tutaj tabela z grupą
                </ModalContent>
            </Modal>
        </main>
    )
}

export default EditMeetingModal;