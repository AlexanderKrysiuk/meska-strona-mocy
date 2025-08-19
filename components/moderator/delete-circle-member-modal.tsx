"use client"

import { DeleteUserFromCircle } from "@/actions/user";
import { DeleteUserFromCircleSchema } from "@/schema/user";
import { faCheck, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const DeleteCircleMemberModal = ({
    membershipId,
    memberName,
    circleName
} : {
    membershipId: string
    memberName?: string | null
    circleName: string | null
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()

    type FormFields = z.infer<typeof DeleteUserFromCircleSchema>

    const {handleSubmit, watch, setValue, formState: {errors, isSubmitting, isValid}} = useForm<FormFields>({
        resolver: zodResolver(DeleteUserFromCircleSchema),
        defaultValues: {
            membershipId: membershipId
        }
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await DeleteUserFromCircle(data)

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
                    <FontAwesomeIcon icon={faTrashCan}/>
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
                                Czy na pewno chcesz usunąć użytkownika <strong>{memberName}</strong> z kręgu <strong>{circleName}</strong> ?
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
                                color="primary"
                                startContent={isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                                type="submit"
                                isDisabled={isSubmitting || !isValid}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Usuń"}
                            </Button>
                            <Button
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