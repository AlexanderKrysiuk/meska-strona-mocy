"use client"

import { ReturnParticipantFromVacation } from "@/actions/participant"
import { ReturnParticipantFromVacationSchema } from "@/schema/participant"
import { ModeratorQueries } from "@/utils/query"
import { faBan, faCheck, faUmbrellaBeach, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleMeetingParticipant, User } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const ReturnParticipantFromVacationModal = ({
    participation,
    user
} : {
    participation: CircleMeetingParticipant
    user: Pick<User, "name">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    type FormFields = z.infer<typeof ReturnParticipantFromVacationSchema>

    
    const {handleSubmit, formState: {isSubmitting}} = useForm<FormFields>({
        resolver: zodResolver(ReturnParticipantFromVacationSchema),
        defaultValues: {
            participationID: participation.id
        }
    })

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async (data) => {
        const result = await ReturnParticipantFromVacation(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.MeetingParticipants, participation.meetingId]})
            onClose()
        }
    }

    return (
        <main>
            <Tooltip
                color="danger"
                placement="top"
                content="Przywróć kręgowca z urlopu"
                className="text-white"
            >
                <Button
                    color="danger"
                    isIconOnly
                    radius="full"
                    variant="light"
                    onPress={onOpen}
                >
                    <span className="fa-layers fa-fw items-center justify-center w-full h-full">
                        <FontAwesomeIcon icon={faUmbrellaBeach} className="text-warning" size="xl"/>
                        <FontAwesomeIcon icon={faBan} className="text-danger" size="lg"/>
                    </span>
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <ModalHeader>Przywróć {user.name} z urlopu</ModalHeader>
                    <ModalBody>Czy na pewno chcesz przywrócić kręgowca z urlopu?</ModalBody>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalFooter className="w-full">
                            <Button
                                fullWidth
                                color="primary"
                                startContent={ isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                                type="submit"
                                isDisabled={isSubmitting}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Przywróć z urlopu"}
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
    )
}
export default ReturnParticipantFromVacationModal