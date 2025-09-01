"use client"

import { AddNewUserToCircle } from "@/actions/user"
import { AddUserToCircleSchema } from "@/schema/user"
import { ModeratorQueries } from "@/utils/query"
import { faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"



const AddCircleMemberModal = ({
    circle,
    circles
} : {
    circle?: Circle
    circles: Circle[]
}) => {
    type FormFields = z.infer<typeof AddUserToCircleSchema>

    const {isOpen, onOpen, onClose} = useDisclosure()
    
    const { handleSubmit, watch, setValue, formState: {errors, isSubmitting, isValid} } = useForm<FormFields>({
        resolver: zodResolver(AddUserToCircleSchema)
    })

    useEffect(() => {
        setValue("circleId", circle?.id!)
    }, [circle, setValue, isOpen])

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await AddNewUserToCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.CircleMembers, data.circleId]})
            onClose()
        }
    }

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faUserPlus}/>}
                onPress={onOpen}
                isDisabled={circles.length < 1}
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
                    {/* <pre>
                        {JSON.stringify(watch(),null,2)}
                    </pre> */}
                    <ModalHeader>Dodaj nowego użytkownika</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
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
                            <Input
                                label="Imię i nazwisko"
                                labelPlacement="outside"
                                type="text"
                                value={watch("name")!}
                                onValueChange={(value) => setValue("name", value, {shouldValidate:true})}
                                placeholder="Jack Sparrow"
                                variant="bordered"
                                isClearable
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.name}
                                errorMessage={errors.name?.message}
                            />
                            <Input
                                label="Email"
                                labelPlacement="outside"
                                type="email"
                                autoComplete="email"
                                value={watch("email")}
                                onValueChange={(value) => setValue("email", value, {shouldValidate:true})}
                                placeholder="jack.sparrow@piratebay.co.uk"
                                variant="bordered"
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.email}
                                errorMessage={errors.email?.message}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={isSubmitting || !isValid}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Dodaj nowego kręgowca"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    )
}

export default AddCircleMemberModal;