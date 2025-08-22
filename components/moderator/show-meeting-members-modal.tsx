"use client"

import { GetMeetingWithMembersByMeetingID } from "@/actions/meeting"
import { formatMeetingDate } from "@/utils/date"
import { faArrowRotateForward, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Chip, Modal, ModalBody, ModalContent, ModalHeader, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User, useDisclosure } from "@heroui/react"
import { Circle, CircleMeeting, City, Country, MeetingParticipantStatus, Region } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
  
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
        case MeetingParticipantStatus.Removed:
            color = "danger";
            message = "Usunięty";
            break;
    }
  
    return <Chip color={color} variant="dot">{message}</Chip>;
  };

const ShowMeetingMembersModal = ({
    meeting,
    circle,
    countries,
    regions,
    cities
} : {
    meeting: CircleMeeting
    circle: Circle
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const { data, isLoading, isError, error, refetch } = useQuery({
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
                    <FontAwesomeIcon icon={faUserGroup}/>
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
                        {formatMeetingDate(
                            meeting.startTime,
                            meeting.endTime,
                            meeting.cityId,
                            countries,
                            regions,
                            cities
                        )} 
                </ModalHeader>
                    {isError ? (
                        <ModalBody>
                            <Alert
                                color="danger"
                                title="Błąd ładowania danych"
                                description={error.message}
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
                            {/* {data && (
                                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            )} */}
                            <Table>
                                <TableHeader>
                                    <TableColumn>Imię i Nazwisko</TableColumn>
                                    <TableColumn>E-mail</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                </TableHeader>
                                <TableBody
                                    isLoading={isLoading}
                                    items={data || []}
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