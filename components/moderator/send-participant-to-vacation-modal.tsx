"use client"

import { SendMemberToVacationSchema } from "@/schema/moderator";
import { ModeratorQueries } from "@/utils/query";
import { faCheck, faRotate, faUmbrellaBeach, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Circle, CircleMeetingParticipant, User } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import Loader from "../loader";
import { GetCricleMembershipByUserAndCirlceIDs } from "@/actions/circle-membership";
import { SendParticipantToVacation } from "@/actions/participant";


export const SendParticipantToVacationModal = ({
    user,
    circle,
    participation,
} : {
    user: Pick<User, "id" | "name">
    circle: Circle
    participation: CircleMeetingParticipant
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    return <main>
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
                <ModalHeader>Wyślij {user.name} na urlop</ModalHeader>
                <SendParticipantToVatacionForm 
                    user={user}
                    circle={circle}
                    participation={participation}
                    onClose={onClose}
                />
            </ModalContent>
        </Modal>
    </main>
}

const SendParticipantToVatacionForm = ({
    user,
    circle,
    participation,
    onClose
} : {
    user: Pick<User, "id" | "name">
    circle: Circle
    participation: CircleMeetingParticipant
    onClose: () => void
}) => {
    const { data: circleMembership, isLoading, refetch } = useQuery({
        queryKey: [ModeratorQueries.MemberCircleMembership, user.id, circle.id],
        queryFn: () => GetCricleMembershipByUserAndCirlceIDs(user.id, circle.id),
    })

    type FormFields = z.infer<typeof SendMemberToVacationSchema>

    const { handleSubmit, formState: {isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(SendMemberToVacationSchema),
        defaultValues: {
            participationID: participation.id,
        }
    })   
    
    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await SendParticipantToVacation(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.MeetingParticipants, participation.meetingId]})
            onClose()
        }
    }

    if (isLoading) return <Loader/>

    if (!circleMembership) return <ModalBody>
        <Alert
        color="danger"
        description="Nie udało się pobrać informacji o urlopie"
        endContent={
            <Button 
                color="danger" 
                onPress={() => refetch()}
                startContent={<FontAwesomeIcon icon={faRotate}/>}
            >
                odśwież
            </Button>
        }
        />
        </ModalBody>

    return <main>
        <ModalBody>
            {circleMembership.vacationDays > 0 ? (
                <p> Kręgowcowi pozostało <strong className="text-warning">{circleMembership.vacationDays} dni urlopu. </strong><br/>
                    Czy na pewno chcesz go wysłać na urlop?
                </p>
                    ) : (
                <p>
                    <strong className="text-danger">Kręgowiec nie ma już dostępnych dni urlopowych!</strong><br/>
                    Czy mimo to chcesz go wysłać na urlop?
                </p>
            )}
        </ModalBody>
        <Form onSubmit={handleSubmit(submit)}>
            <ModalFooter className="w-full">
                <Button
                    fullWidth
                    color="primary"
                    startContent={ isSubmitting ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                    type="submit"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Wyślij na urlop"}
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
        {/* <pre>

            {JSON.stringify(circleMembership,null,2)}
        </pre> */}
    </main> 
}


// const SendMemberToVacationModal2 = ({
//     participationID,
//     meetingID,
//     member,
//     circle
// } : {
//     participationID: string
//     meetingID: string
//     member: Pick<User, "id" | "name">
//     circle: Circle
// }) => {
//     const {isOpen, onOpen, onClose} = useDisclosure()

//     const { data: circleMembership, isLoading } = useQuery({
//         queryKey: [ModeratorQueries.MemberCircleMembership, member.id, circle.id],
//         queryFn: () => GetCricleMembershipByUserAndCirlceIDs(member.id, circle.id),
//         enabled: isOpen
//     })

//     type FormFields = z.infer<typeof SendMemberToVacationSchema>

//     const { handleSubmit } = useForm<FormFields>({
//         resolver: zodResolver(SendMemberToVacationSchema),
//         defaultValues: {
//             participationID: participationID,
//         }
//     })

//     const submit: SubmitHandler<FormFields> = async(data) => {
//         mutation.mutate(data)
//     }

//     const queryClient = useQueryClient();

//     const mutation = useMutation<void, Error, FormFields>({
//         mutationFn: SendMemberToVacation,
//         onSuccess: () => {
//             addToast({
//                 title: "Pomyślnie wysłano kręgowca na urlop",
//                 color: "success"
//             });
//             queryClient.invalidateQueries({ queryKey: ["participants", meetingID]});
//             onClose();
//         },
//         onError: (error) => {
//             addToast({
//                 title: error.message,
//                 color: "danger"
//             });
//         },
//     });

//     if (!isLoading) return <Loader/>
    
//     if (!circleMembership) {
//         return (
//           <p className="text-red-500">
//             Nie można znaleźć członkostwa w kręgu dla tego użytkownika.
//           </p>
//         );
//       }

//     return ( 
//         <main>
//             <Tooltip
//                 color="warning"
//                 placement="top"
//                 content="Wyślij kręgowca na urlop"
//                 className="text-white"
//             >
//                 <Button
//                     color="warning"
//                     isIconOnly
//                     radius="full"
//                     variant="light"
//                     onPress={onOpen}
//                 >
//                     <FontAwesomeIcon icon={faUmbrellaBeach} size="xl"/>
//                 </Button>
//             </Tooltip>
//             <Modal
//                 isOpen={isOpen}
//                 onClose={onClose}
//                 placement="center"
//                 scrollBehavior="outside"
//             >
//                 <ModalContent>
//                     <ModalHeader>Wyślij {member.name} na urlop</ModalHeader>
//                     <Form onSubmit={handleSubmit(submit)}>
//                         <ModalBody>
//                             {circleMembership.vacationDays > 0 ? (
//                                 <p>
//                                     Kręgowcowi pozostało <strong className="text-warning">{member.vacationDays}</strong> dni urlopu.
//                                 </p>
//                             ) : (
//                                 <p>
//                                     <strong className="text-danger">Kręgowiec nie ma już dostępnych dni urlopowych!</strong><br/>
//                                     Czy mimo to chcesz go wysłać na urlop?
//                                 </p>
//                             )}
//                         </ModalBody>
//                         <ModalFooter className="w-full">
//                             <Button
//                                 color="primary"
//                                 startContent={mutation.isPending ? undefined : <FontAwesomeIcon icon={faCheck}/>}
//                                 type="submit"
//                                 isDisabled={mutation.isPending}
//                                 isLoading={mutation.isPending}
//                             >
//                                 {mutation.isPending ? "Przetwarzanie..." : "Wyślij na urlop"}
//                             </Button>
//                             <Button
//                                 color="danger"
//                                 startContent={<FontAwesomeIcon icon={faXmark}/>}
//                                 onPress={onClose}
//                                 isDisabled={mutation.isPending}
//                             >
//                                 Anuluj
//                             </Button>
//                         </ModalFooter>
//                     </Form>
//                 </ModalContent>
//             </Modal>
//         </main>
//      );
// }
 
