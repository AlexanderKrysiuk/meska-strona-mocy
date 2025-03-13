"use client"

import { CreateGroup } from "@/actions/group";
import { CreateGroupSchema } from "@/schema/group";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const CreateGroupModal = () => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()
    
    type FormFields = z.infer<typeof CreateGroupSchema>

    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateGroupSchema)
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        try {
            await CreateGroup(data)
            addToast({
                title: "Utworzono nową grupę",
                color: "success",
                variant: "bordered"
            })
            router.refresh()
            onClose()
        } catch(error) {
            setError("root", {message: error instanceof Error ? error.message : "Wystąpił nieznany błąd"})
        }
    }

    return ( 
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faSquarePlus}/>}
                className="text-white"
                onPress={onOpen}
            >
                Utwórz nową grupę
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalContent>
                    <ModalHeader>Nowa grupa</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <Input {...register("name")}
                                label="Nazwa grupy"
                                labelPlacement="outside"
                                type="text"
                                placeholder="Załoga Czarnej Perły"
                                variant="bordered"
                                isClearable
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.name || !!errors.root}
                                errorMessage={errors.name?.message}
                            />
                            <Input {...register("maxMembers", {valueAsNumber: true})}
                                label="Maksymalna liczba uczestników"
                                labelPlacement="outside"
                                type="number"
                                placeholder="11"
                                variant="bordered"
                                min={1}
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.maxMembers || !!errors.root}
                                errorMessage={errors.maxMembers?.message} 
                            />
                            {errors.root && 
                                <Alert
                                    title={errors.root.message}
                                    variant="bordered"
                                    color="danger"
                                />
                            }
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={isSubmitting || !watch("name") || !watch("maxMembers")}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Utwórz nową grupę"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    );
}
export default CreateGroupModal;