"use client"

import { ManualAddUserToCircle } from "@/schema/user"
import { faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle } from "@prisma/client"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"



const AddCircleMemberModal = ({
    defaultCircleId,
    circles
} : {
    defaultCircleId?: string
    circles: Circle[]
}) => {
    type FormFields = z.infer<typeof ManualAddUserToCircle>
    const {isOpen, onOpen, onClose} = useDisclosure()
    
    const { handleSubmit, watch, setValue } = useForm<FormFields>({
        resolver: zodResolver(ManualAddUserToCircle)
    })

    useEffect(() => {
        setValue("circleId", defaultCircleId!)
    }, [defaultCircleId, setValue, isOpen])

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faUserPlus}/>}
                onPress={onOpen}
                isDisabled={!circles}
            >
                Dodaj nowego kręgowca
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <pre>
                        {JSON.stringify(watch(),null,2)}
                    </pre>
                    <ModalHeader>Dodaj nowego użytkownika</ModalHeader>
                    <Form onSubmit={handleSubmit(()=>{})}>
                        <ModalBody className="w-full">
                            <Select
                                label="Krąg"
                                items={circles}
                                placeholder="Wybierz krąg"
                                variant="bordered"
                                selectedKeys={[watch("circleId")]}
                                onSelectionChange={(keys) => {
                                    setValue("circleId", Array.from(keys)[0] as string, {shouldValidate:true})
                                }}
                                isDisabled={!circles}
                                hideEmptyContent
                                disallowEmptySelection
                            >
                                {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                            </Select>
                        </ModalBody>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    )
}

export default AddCircleMemberModal;