"use client"

import { ReturnMemberFromVacationSchema, SendMemberToVacationSchema } from "@/schema/moderator"
import { faBan, faUmbrellaBeach } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Modal, ModalContent, ModalHeader, Tooltip, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

const ReturnMemberFromVacationModal = ({
    participationID,
    member
} : {
    participationID: string
    member: Pick<User, "name">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    type FormFields = z.infer<typeof ReturnMemberFromVacationSchema>

    const {} = useForm<FormFields>({
        resolver: zodResolver(SendMemberToVacationSchema),
        defaultValues: {
            participationID: participationID
        }
    })

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
                    <ModalHeader>Przywróć {member.name} z urlopu</ModalHeader>
                </ModalContent>
            </Modal>
        </main>
    )
}
export default ReturnMemberFromVacationModal