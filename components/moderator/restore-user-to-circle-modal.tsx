"use client"

import { RestoreMembership } from "@/actions/membership"
import { RestoreMembershipSchema } from "@/schema/membership"
import { ModeratorQueries } from "@/utils/query"
import { faArrowRotateBack, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, Membership, User } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const RestoreUserToCircleModal = ({
    membership,
    member,
    circle
} : {
    membership: Membership
    member: Pick<User, "id" | "name">
    circle: Pick<Circle, "id" | "name">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    type FormFields = z.infer<typeof RestoreMembershipSchema>

    const { handleSubmit, formState: {isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(RestoreMembershipSchema),
        defaultValues: {
            membershipId: membership.id
        }
    })

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await RestoreMembership(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.CircleMembers, circle.id]})
            onClose()
        }
    }

    return (
        <main>
            <Tooltip
                color="warning"
                placement="top"
                content="Przywróć kręgowca"
                className="text-white"
            >
                <Button
                    color="warning"
                    isIconOnly
                    radius="full"
                    variant="light"
                    onPress={onOpen}
                >
                    <FontAwesomeIcon icon={faArrowRotateBack} size="xl"/>
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
            >
                <ModalContent>
                    <ModalHeader>Przywróć kręgowca</ModalHeader>
                    <ModalBody>
                        <div>
                            Czy na pewno chcesz przywrócić kręgowca <strong>{` ${member.name} `}</strong> <br/> do kręgu <strong>{` ${circle.name}`}</strong>?
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
                                {isSubmitting ? "Przywracanie..." : "Przwróć"}
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
export default RestoreUserToCircleModal;