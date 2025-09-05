"use client"

import { faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Chip, Modal, ModalBody, ModalContent, ModalHeader, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User, useDisclosure } from "@heroui/react"
import { Circle, CircleMeeting, Country, Currency, MeetingParticipantStatus } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { ModeratorQueries } from "@/utils/query"
import { GetMeetingParticipantsByMeeting } from "@/actions/meeting-participants"
import { formatedDate } from "@/utils/date"
import { SendParticipantToVacationModal } from "./send-participant-to-vacation-modal"
import ReturnParticipantFromVacationModal from "./return-participant-from-vacation-modal"
import { PayForParticipantModal } from "./pay-for-participant-modal"
  
const StatusChip = ({ status }: { status: MeetingParticipantStatus }) => {
    let color: "primary" | "success" | "danger" | "warning" | "default" = "default";
    let message: string = status;
  
    switch (status) {
        case MeetingParticipantStatus.Active:
            color = "success";
            message = "Aktywny";
            break;
        case MeetingParticipantStatus.Vacation:
            color = "warning";
            message = "Urlop";
            break;
        // case MeetingParticipantStatus.Pending:
        //     color = "primary";
        //     message = "Nieopłacony";
        //     break;
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
    country,
    currency
} : {
    meeting: CircleMeeting
    circle: Circle
    country: Country
    currency: Currency
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const { data: participants, isLoading } = useQuery({
        queryKey: [ModeratorQueries.MeetingParticipants, meeting.id],
        queryFn: () => GetMeetingParticipantsByMeeting(meeting.id),
        enabled: isOpen,
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
                    <FontAwesomeIcon icon={faUserGroup} size="xl"/>
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
                        Kręgowcy {circle.name} zapisani na spotkanie dnia: {" "} {formatedDate(meeting.startTime, meeting.endTime, country.timeZone, "onlyDays")}
                        
                        {/* {formatMeetingDate(
                            meeting.startTime,
                            meeting.endTime,
                            meeting.cityId,
                            countries,
                            regions,
                            cities
                        )}  */}
                    </ModalHeader>
                    <ModalBody> 
                        <Table>
                            <TableHeader>
                                <TableColumn>Imię i Nazwisko</TableColumn>
                                <TableColumn>E-mail</TableColumn>
                                <TableColumn>Wpłata</TableColumn>
                                <TableColumn align="center">Status</TableColumn>
                                <TableColumn align="center">Akcje</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={participants ?? []}
                                isLoading={isLoading}
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
                                        <TableCell>{item.amountPaid}/{meeting.price} {currency.code}</TableCell>
                                        <TableCell><StatusChip status={item.status}/></TableCell>
                                        <TableCell className="flex">
                                            {item.status === MeetingParticipantStatus.Vacation ? (
                                                <ReturnParticipantFromVacationModal
                                                    participation={item}
                                                    user={item.user}
                                                />
                                            ) : (
                                                item.status === MeetingParticipantStatus.Active && ( // tylko aktywni mogą iść na wakacje
                                                    <SendParticipantToVacationModal
                                                        user={item.user}
                                                        circle={circle}
                                                        participation={item}
                                                    />
                                                )
                                            )}
                                            {item.status === MeetingParticipantStatus.Active && (
                                                <PayForParticipantModal
                                                    participation={item}
                                                    meeting={meeting}
                                                    country={country}
                                                    user={item.user}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </main>
    )
}
export default ShowMeetingMembersModal