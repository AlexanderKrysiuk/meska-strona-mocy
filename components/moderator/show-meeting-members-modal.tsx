"use client"

import { GetMeetingWithMembersByMeetingID } from "@/actions/meeting"
import { faArrowRotateForward, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Chip, Modal, ModalBody, ModalContent, ModalHeader, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User, useDisclosure } from "@heroui/react"
import { Circle, CircleMeeting, MeetingParticipantStatus } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import SendMemberToVacationModal from "./send-member-to-vacation-modal"
import ReturnMemberFromVacationModal from "./return-member-from-vacation-modal"
  
const StatusChip = ({ status }: { status: MeetingParticipantStatus }) => {
    let color: "primary" | "success" | "danger" | "warning" | "default" = "default";
    let message: string = status;
  
    switch (status) {
        case MeetingParticipantStatus.Confirmed:
            color = "success";
            message = "Potwierdzony";
            break;
        case MeetingParticipantStatus.Vacation:
            color = "warning";
            message = "Urlop";
            break;
        case MeetingParticipantStatus.Pending:
            color = "primary";
            message = "Nieopłacony";
            break;
        case MeetingParticipantStatus.Cancelled:
            color = "danger";
            message = "Usunięty";
            break;
    }
  
    return <Chip color={color} variant="dot">{message}</Chip>;
  };

const ShowMeetingMembersModal = ({
    meeting,
    circle,
} : {
    meeting: CircleMeeting
    circle: Circle
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const { data, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ["participants", meeting.id],
        queryFn: () => GetMeetingWithMembersByMeetingID(meeting.id),
        enabled: isOpen,
        retry: false
    });  

    return (
        <main>
            <Tooltip
                color="primary"
                placement="top"
                content="Kręgowcy"
            >
                <Button
                    color="primary"
                    isIconOnly
                    onPress={onOpen}
                    variant="light"
                    radius="full"
                >
                    <FontAwesomeIcon icon={faUserGroup} size="lg"/>
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
                size="5xl"
            >
                <ModalContent>
                <ModalHeader>
                    Kręgowcy {circle.name} zapisani na spotkanie: {" "}
                        
                        {/* {formatMeetingDate(
                            meeting.startTime,
                            meeting.endTime,
                            meeting.cityId,
                            countries,
                            regions,
                            cities
                        )}  */}
                </ModalHeader>
                    {isError ? (
                        <ModalBody>
                            <Alert
                                color="danger"
                                title="Błąd ładowania danych"
                                endContent={
                                    <Button
                                        color="danger"
                                        startContent={<FontAwesomeIcon icon={faArrowRotateForward}/>}
                                        onPress={()=>refetch()}
                                    >
                                        Odśwież
                                    </Button>
                                }
                            />
                        </ModalBody>
                    ) : (
                        <ModalBody>
                            {data && (
                                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableColumn>Imię i Nazwisko</TableColumn>
                                    <TableColumn>E-mail</TableColumn>
                                    <TableColumn align="center">Status</TableColumn>
                                    <TableColumn align="center">Akcje</TableColumn>
                                </TableHeader>
                                <TableBody
                                    isLoading={isLoading || isFetching}
                                    items={data?.participants || []}
                                    loadingContent={<Spinner label="Ładowanie" variant="wave"/>}
                                    emptyContent={"Brak kręgowców"}
                                >
                                    {(item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <User
                                                    avatarProps={{
                                                        showFallback: true,
                                                        src: item.user.image!
                                                    }}
                                                    name={item.user.name ?? "Brak danych"}
                                                />
                                            </TableCell>
                                            <TableCell>{item.user.email}</TableCell>
                                            <TableCell><StatusChip status={item.status}/></TableCell>
                                            <TableCell>
                                                {item.status === MeetingParticipantStatus.Vacation
                                                    ?   <ReturnMemberFromVacationModal
                                                            participationID={item.id}
                                                            member={item.user}
                                                        />
                                                    :   <SendMemberToVacationModal
                                                            participationID={item.id}
                                                            member={item.user}
                                                            meetingID={item.meetingId}
                                                        />
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </main>
    )
}
export default ShowMeetingMembersModal