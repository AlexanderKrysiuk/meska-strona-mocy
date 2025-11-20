"use client"

import { RemoveMembershipByModerator } from "@/actions/membership";
import { RemoveMembershipSchema } from "@/schema/membership";
import { MembershipAction, isMembershipActionAllowed } from "@/utils/membership";
import { ModeratorQueries } from "@/utils/query";
import { faCheck, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Circle, Membership, User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const DeleteCircleMemberModal = ({
    membership,
    member,
    circle,
} : {
    membership: Pick<Membership, "id" | "status">
    member: Pick<User, "name">
    circle: Pick<Circle, "id" | "name">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    type FormFields = z.infer<typeof RemoveMembershipSchema>

    const {handleSubmit, watch, setValue, formState: {errors, isSubmitting, isValid}} = useForm<FormFields>({
        resolver: zodResolver(RemoveMembershipSchema),
        defaultValues: {
            membershipId: membership.id
        }
    })

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await RemoveMembershipByModerator(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.CircleMembers, circle.id]})
            onClose()
        }
    }


    if (isMembershipActionAllowed(membership.status, MembershipAction.Remove)) return <main>
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
                            Czy na pewno chcesz usunąć użytkownika <strong>{member.name}</strong><br/> z kręgu <strong>{circle.name}</strong> ?
                        </div>
                        {/* {JSON.stringify(watch(),null,2)} */}
                        <Textarea
                            label="Powód (opcjonalny)"
                            description="Powód zostanie przekazany w mailu"
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
}
 
export default DeleteCircleMemberModal;