"use client"

import { CreateCircle } from "@/actions/circle";
import { clientAuth } from "@/hooks/auth";
import { CreateCircleSchema } from "@/schema/circle";
import { ModeratorQueries } from "@/utils/query";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const CreateCircleModal = () => {
    const moderator = clientAuth()
    
    const {isOpen, onOpen, onClose} = useDisclosure()
    
    type FormFields = z.infer<typeof CreateCircleSchema>

    const { handleSubmit, watch, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(CreateCircleSchema)
    })

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await CreateCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.Circles, moderator?.id]})
            onClose()
        }
    }

    return ( 
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCirclePlus}/>}
                className="text-white"
                onPress={onOpen}
            >
                Utwórz nowy krąg
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
            >
                <ModalContent>
                    <ModalHeader>Nowy krąg</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <Input
                                label="Nazwa kręgu"
                                labelPlacement="outside"
                                type="text"
                                placeholder="Załoga Czarnej Perły"
                                variant="bordered"
                                value={watch("name")}
                                onValueChange={(value) => setValue("name", value, {shouldValidate:true})}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.name}
                                errorMessage={errors.name?.message}
                            />
                            {/* <NumberInput
                                label="Maksymalna liczba uczestników"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="11"
                                minValue={1}
                                maxValue={15}
                                formatOptions={{ maximumFractionDigits: 0 }}
                                value={watch("maxMembers")}
                                onValueChange={(value) => setValue("maxMembers", value, {shouldValidate:true})}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.maxMembers}
                                errorMessage={errors.maxMembers?.message}
                            /> */}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={isSubmitting || !isValid}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Utwórz nowy krąg"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    );
}
export default CreateCircleModal;