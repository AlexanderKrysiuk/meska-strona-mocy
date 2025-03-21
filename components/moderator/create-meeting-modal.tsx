"use client"

import { CreateMeetingSchema } from "@/schema/meeting";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, DateInput, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Group } from "@prisma/client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from 'zod'

const CreateMeetingModal = ({
    group
} : {
    group: Group
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()

    type FormFields = z.infer<typeof CreateMeetingSchema>
    
    const  { register, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema)
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        addToast({
            title: data.id
        })
    }

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
                className="text-white"
                onPress={onOpen}
            >
                Utwórz nowe spotkanie
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalContent>
                    <ModalHeader>Nowe Spotkanie dla grupy {group.name}</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <input type="hidden" {...register("id")}/>
                            {/*}
                            <Select
                                label="Grupa"
                                labelPlacement="outside"
                                placeholder="Wybierz grupę"
                                variant="bordered"
                                items={Array.isArray(groups) ? groups : [groups]}
                                isDisabled={!Array.isArray(groups) || groups.length === 1}
                                value={groups.length === 1 ? groups[0].id : undefined}  // Jeśli tylko jedna grupa, ustawiamy id jako wartość
                            >
                                {(group) => <SelectItem>{group.name}</SelectItem>}
                            </Select>
                            */}
                            <DateInput
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                isRequired
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Dodaj nowe spotkanie"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>

    );
}
 
export default CreateMeetingModal;