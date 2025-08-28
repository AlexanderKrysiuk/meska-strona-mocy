"use client"

import { CompleteMeeting } from "@/actions/meeting"
import { clientAuth } from "@/hooks/auth"
import { CompleteMeetingSchema } from "@/schema/meeting"
import { formatedDate } from "@/utils/date"
import { ModeratorQueries } from "@/utils/query"
import { faCalendarCheck, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, CircleMeeting } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

export const CompleteMeetingModal = ({
    meeting,
    circle,
} : {
    meeting: CircleMeeting,
    circle: Circle
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const moderator = clientAuth()

    type FormFields = z.infer<typeof CompleteMeetingSchema>

    const { handleSubmit, formState: {isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(CompleteMeetingSchema),
            defaultValues: {
            meetingId: meeting.id
        }
    })
    
    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await CompleteMeeting(data)
    
        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
        })
    
        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.ScheduledMeetings, moderator?.id]})
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.CompletedMeetings, moderator?.id]})
            onClose()
        }
    }
    
    return <main>
        <Tooltip
            color="success"
            placement="top"
            content="Zakończ spotkanie"
            className="text-white"
        >
            <Button
                color="success"
                isIconOnly
                radius="full"
                variant="light"
                onPress={onOpen}
                isDisabled={meeting.endTime > new Date()}
            >
                <FontAwesomeIcon icon={faCalendarCheck} size="xl"/>
            </Button>
        </Tooltip>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
        >
            <ModalContent>
                <ModalHeader>Zakończenie spotkania</ModalHeader>
                <ModalBody>
                    <div>
                        Czy na pewno chcesz zakończyć spotkanie kręgu:{" "} <strong>{circle.name}</strong>
                    </div>
                    <div>
                        Data: <strong>{formatedDate(meeting.startTime, meeting.endTime)}</strong>
                    </div>
                    <div className="text-danger font-semibold">
                        Zakończonego spotkania nie będzie można edytować. Kończ tylko spotkania, które już się faktycznie odbyły.
                    </div>
                </ModalBody>
                <Form onSubmit={handleSubmit(submit)}>
                    <ModalFooter className="w-full">
                        <Button
                            fullWidth
                            color="primary"
                            startContent={isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                            type="submit"
                            isDisabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? "Przetwarzanie..." : "Zakończ"}
                        </Button>
                        <Button
                            fullWidth
                            color="danger"
                            startContent={<FontAwesomeIcon icon={faXmark}/>}
                            onPress={onClose}
                            isDisabled={isSubmitting}
                        >
                            Anuluj
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    </main>
}