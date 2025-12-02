"use client"

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@heroui/react"
import { Circle, Participation, ParticipationStatus, User } from "@prisma/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate, faCheck, faUmbrellaBeach, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useQuery } from "@tanstack/react-query"
import { ModeratorQueries } from "@/utils/query"
import { GetMembershipByUserIdAndCircleId } from "@/actions/membership"
import Loader from "../loader"
//import { ToggleVacationStatus } from "@/actions/participation"
import { SubmitHandler, useForm } from "react-hook-form"

const vacationText = (days: number) => {
    if (days === 1) return "1 dzień urlopu";
    return `${days} dni urlopu`;
}

export const ParticipantVacationModal = ({
    user,
    circle,
    //meeting,
    participation
} : {
    user: Pick<User, "id" | "name">
    circle: Pick<Circle, "id" | "name">
    //meeting: Pick<Meeting, "id">
    participation: Pick<Participation, "id" | "status">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const { handleSubmit, formState: {isSubmitting} } = useForm<{ participationID: string }>()

    const { data: membership } = useQuery({
        queryKey: [ModeratorQueries.Membership, user.id, circle.id],
        queryFn: () => GetMembershipByUserIdAndCircleId(user.id, circle.id),
        enabled: !!isOpen
    })

    //const queryClient = useQueryClient()
    
    type FormFields = { participationID: string }

    const submit: SubmitHandler<FormFields> = async() => {
        //const result = await ToggleVacationStatus(participation.id)

        // addToast({
        //     title: result.message,
        //     color: result.success ? "success" : "danger"
        // })

        // if (result.success) {
        //     queryClient.invalidateQueries({queryKey: [ModeratorQueries.Membership, user.id, circle.id]})
        //     queryClient.invalidateQueries({queryKey: [ModeratorQueries.MeetingParticipants, meeting.id]})
        //     onClose()
        // }
    }

    return <main>
        <Tooltip
            color={participation.status === ParticipationStatus.Vacation ? "danger" : "warning"}
            placement="top"
            content={participation.status === ParticipationStatus.Vacation ? "Przywróć kręgowca z urlopu" : "Wyślij kręgowca na urlop"}
            className="text-white"
        >
            <Button
                color="warning"
                isIconOnly
                radius="full"
                variant="light"
                onPress={onOpen}
            >
                <span className="fa-layers fa-fw fa-xl">
                    <FontAwesomeIcon icon={faUmbrellaBeach}/>
                    {participation.status === ParticipationStatus.Vacation && 
                        <FontAwesomeIcon 
                            icon={faArrowsRotate} 
                            className="text-danger" 
                            transform="shrink-4" // zmniejsza overlay, żeby nie przykrywał całego tła
                        />
                    }
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
                <ModalHeader>{participation.status === ParticipationStatus.Vacation ? `Przywróć ${user.name} z urlopu` : `Wyślij ${user.name} na urlop`}</ModalHeader>
                <ModalBody>
                    {participation.status === ParticipationStatus.Vacation ? (
                        `Czy na pewno chcesz przywrócić kręgowca z urlopu`
                    ) : (
                        membership ? (
                            membership.vacationDays > 0 ? (
                                <div>
                                    Kręgowcowi pozostało{" "}
                                    <strong className="text-warning">
                                        {vacationText(membership.vacationDays)}
                                    </strong>
                                    <br/>
                                    Czy na pewno chcesz go wysłać na urlop?
                                </div>
                            ) : (
                                <div>
                                    <strong className="text-danger">
                                        Kręgowiec nie ma już dostępnych dni urlopowych!
                                    </strong>
                                    <br/>
                                    Czy mimo to chcesz go wysłać na urlop?
                                </div>
                            )
                        ) : (
                            <Loader/>
                        )
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        fullWidth
                        color="primary"
                        onPress={() => handleSubmit(submit)()}
                        isLoading={isSubmitting}
                        startContent={isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck} size="xl"/>}
                    >
                        {isSubmitting ? (
                            `Przetwarzanie...`
                        ) : (
                            participation.status === ParticipationStatus.Vacation ? (
                                `Przywróć`
                            ) : (
                                `Wyślij`
                            )
                        )}
                    </Button>
                    <Button
                        fullWidth
                        color="danger"
                        onPress={()=>onClose()}
                        startContent={<FontAwesomeIcon icon={faXmark} size="xl"/>}
                    >
                        Anuluj
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </main>
}

