"use client"

import { DeleteMemberFromCircle } from "@/actions/member";
import { DeleteMemberFromCircleSchema } from "@/schema/member";
import { ModeratorQueries } from "@/utils/query";
import { faCheck, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleMembership } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const DeleteCircleMemberModal = ({
    membership,
    memberName,
    circleName
} : {
    membership: CircleMembership
    memberName?: string | null
    circleName: string | null
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    type FormFields = z.infer<typeof DeleteMemberFromCircleSchema>

    const {handleSubmit, watch, setValue, formState: {errors, isSubmitting, isValid}} = useForm<FormFields>({
        resolver: zodResolver(DeleteMemberFromCircleSchema),
        defaultValues: {
            membershipId: membership.id
        }
    })

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await DeleteMemberFromCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.CircleMembers, membership.circleId]})
            onClose()
        }
    }

    return (
        <main>
            <Tooltip
                color="danger"
                placement="top"
                content="Wyrzuć z kręgu"
            >
                <Button
                    color="danger"
                    isIconOnly
                    onPress={onOpen}
                    radius="full"
                    variant="light"
                >
                    <FontAwesomeIcon icon={faTrashCan} size="xl"/>
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
            >
                <ModalContent>
                    <ModalHeader>Usunięcie użytkownika z kręgu</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody>
                            <div>
                                Czy na pewno chcesz usunąć użytkownika <strong>{memberName}</strong><br/> z kręgu <strong>{circleName}</strong> ?
                            </div>
                            {/* {JSON.stringify(watch(),null,2)} */}
                            <Textarea
                                label="Powód (opcjonalny)"
                                variant="bordered"
                                value={watch("reason") ?? undefined}
                                onValueChange={(value) => setValue("reason", value)}
                                isClearable
                                isInvalid={!!errors.reason}
                                isDisabled={isSubmitting}
                                errorMessage={errors.reason?.message}
                            />
                        </ModalBody>
                        <ModalFooter className="w-full">
                            <Button
                                fullWidth
                                color="primary"
                                startContent={isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                                type="submit"
                                isDisabled={isSubmitting || !isValid}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Usuń"}
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
    );
}
 
export default DeleteCircleMemberModal;