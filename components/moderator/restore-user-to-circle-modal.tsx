"use client"

import { RestoreUserToCircle } from "@/actions/user"
import { RestoreUserToCircleSchema } from "@/schema/user"
import { faArrowRotateBack, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const RestoreUserToCircleModal = ({
    member,
    circle
} : {
    member: Pick<User, "id" | "name">
    circle: Pick<Circle, "id" | "name">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()

    type FormFields = z.infer<typeof RestoreUserToCircleSchema>

    const { handleSubmit, formState: {isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(RestoreUserToCircleSchema),
        defaultValues: {
            userId: member.id,
            circleId: circle.id
        }
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await RestoreUserToCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            router.refresh()
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
                    <FontAwesomeIcon icon={faArrowRotateBack}/>
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
                            Czy na pewno chcesz przywrócić kręgowca <strong>{` ${member.name} `}</strong> do kręgu <strong>{` ${circle.name}`}</strong>?
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
                                {isSubmitting ? "Przywracanie..." : "Przwróć"}
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
export default RestoreUserToCircleModal;