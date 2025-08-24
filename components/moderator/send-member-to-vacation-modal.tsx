"use client"

import { SendMemberToVacation } from "@/actions/moderator";
import { SendMemberToVacationSchema } from "@/schema/moderator";
import { faCheck, faUmbrellaBeach, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const SendMemberToVacationModal = ({
    participationID,
    meetingID,
    member
} : {
    participationID: string
    meetingID: string
    member: Pick<User, "name" | "vacationDays">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    type FormFields = z.infer<typeof SendMemberToVacationSchema>

    const { handleSubmit } = useForm<FormFields>({
        resolver: zodResolver(SendMemberToVacationSchema),
        defaultValues: {
            participationID: participationID,
        }
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        mutation.mutate(data)
    }

    const queryClient = useQueryClient();

    const mutation = useMutation<void, Error, FormFields>({
        mutationFn: SendMemberToVacation,
        onSuccess: () => {
            addToast({
                title: "Pomyślnie wysłano kręgowca na urlop",
                color: "success"
            });
            queryClient.invalidateQueries({ queryKey: ["participants", meetingID]});
            onClose();
        },
        onError: (error) => {
            addToast({
                title: error.message,
                color: "danger"
            });
        },
    });
    
    return ( 
        <main>
            <Tooltip
                color="warning"
                placement="top"
                content="Wyślij kręgowca na urlop"
                className="text-white"
            >
                <Button
                    color="warning"
                    isIconOnly
                    radius="full"
                    variant="light"
                    onPress={onOpen}
                >
                    <FontAwesomeIcon icon={faUmbrellaBeach} size="xl"/>
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <ModalHeader>Wyślij {member.name} na urlop</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody>
                            {member.vacationDays > 0 ? (
                                <p>
                                    Kręgowcowi pozostało <strong className="text-warning">{member.vacationDays}</strong> dni urlopu.
                                </p>
                            ) : (
                                <p>
                                    <strong className="text-danger">Kręgowiec nie ma już dostępnych dni urlopowych!</strong><br/>
                                    Czy mimo to chcesz go wysłać na urlop?
                                </p>
                            )}
                        </ModalBody>
                        <ModalFooter className="w-full">
                            <Button
                                color="primary"
                                startContent={mutation.isPending ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                                type="submit"
                                isDisabled={mutation.isPending}
                                isLoading={mutation.isPending}
                            >
                                {mutation.isPending ? "Przetwarzanie..." : "Wyślij na urlop"}
                            </Button>
                            <Button
                                color="danger"
                                startContent={<FontAwesomeIcon icon={faXmark}/>}
                                onPress={onClose}
                                isDisabled={mutation.isPending}
                            >
                                Anuluj
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
     );
}
 
export default SendMemberToVacationModal;