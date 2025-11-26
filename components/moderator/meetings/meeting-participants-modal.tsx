// "use client"

// import { faUserGroup } from "@fortawesome/free-solid-svg-icons"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { Button, Chip, Modal, ModalBody, ModalContent, ModalHeader, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User, useDisclosure } from "@heroui/react"
// import { Circle, Country, Meeting, MeetingStatus, ParticipationStatus } from "@prisma/client"
// import { useQuery } from "@tanstack/react-query"
// import { ModeratorQueries } from "@/utils/query"
// import { GetParticipantsByMeetingID } from "@/actions/participation"
// import { formatedDate } from "@/utils/date"
// //import { PayForParticipantModal } from "./pay-for-participant-modal"
// //import { ParticipantVacationModal } from "./participant-vacation-modal"
// //import { PayForParticipantModal } from "./pay-for-participant-modal"
  
// const StatusChip = ({ status }: { status: ParticipationStatus }) => {
//     let color: "primary" | "success" | "danger" | "warning" | "default" = "default";
//     let message: string = status;
  
//     switch (status) {
//         case ParticipationStatus.Active:
//             color = "success";
//             message = "Aktywny";
//             break;
//         case ParticipationStatus.Vacation:
//             color = "warning";
//             message = "Urlop";
//             break;
//         // case MeetingParticipantStatus.Pending:
//         //     color = "primary";
//         //     message = "Nieopłacony";
//         //     break;
//         case ParticipationStatus.Cancelled:
//             color = "danger";
//             message = "Usunięty";
//             break;
//     }
  
//     return <Chip color={color} variant="dot">{message}</Chip>;
//   };

// const MeetingParticipantsModal = ({
//     meeting,
//     circle,
//     country,    
// } : {
//     meeting: Pick<Meeting, "id">
//     circle: Pick<Circle, "name">
//     country: Pick<Country, "timeZone">
// }) => {
//     const {isOpen, onOpen, onClose} = useDisclosure()

//     const { data: participants, isLoading } = useQuery({
//         queryKey: [ModeratorQueries.MeetingParticipants, meeting.id],
//         queryFn: () => GetParticipantsByMeetingID(meeting.id),
//         enabled: isOpen,
//     });  

//     return (
//         <main>
//             <Tooltip
//                 color="primary"
//                 placement="top"
//                 content="Kręgowcy"
//             >
//                 <Button
//                     color="primary"
//                     isIconOnly
//                     onPress={onOpen}
//                     variant="light"
//                     radius="full"
//                 >
//                     <FontAwesomeIcon icon={faUserGroup} size="xl"/>
//                 </Button>
//             </Tooltip>
//             <Modal
//                 isOpen={isOpen}
//                 onClose={onClose}
//                 placement="center"
//                 scrollBehavior="outside"
//                 size="5xl"
//             >
//                 <ModalContent>
//                     <ModalHeader>
//                         Kręgowcy {circle.name} zapisani na spotkanie dnia: {" "} {formatedDate(meeting.startTime, meeting.endTime, country.timeZone, "onlyDays")}
                        
//                         {/* {formatMeetingDate(
//                             meeting.startTime,
//                             meeting.endTime,
//                             meeting.cityId,
//                             countries,
//                             regions,
//                             cities
//                         )}  */}
//                     </ModalHeader>
//                     <ModalBody> 
//                         <Table>
//                             <TableHeader>
//                                 <TableColumn>Imię i Nazwisko</TableColumn>
//                                 <TableColumn>E-mail</TableColumn>
//                                 <TableColumn>Wpłata</TableColumn>
//                                 <TableColumn align="center">Status</TableColumn>
//                                 <TableColumn align="center">Akcje</TableColumn>
//                             </TableHeader>
//                             <TableBody
//                                 items={participants ?? []}
//                                 isLoading={isLoading}
//                                 loadingContent={<Spinner label="Ładowanie" variant="wave"/>}
//                                 emptyContent={"Brak kręgowców"}
//                             >
//                                 {(item) => (
//                                     <TableRow key={item.id}>
//                                         <TableCell>
//                                             <User
//                                                 avatarProps={{
//                                                     showFallback: true,
//                                                     src: item.membership.user.image!
//                                                 }}
//                                                 name={item.membership.user.name ?? "Brak danych"}
//                                             />
//                                         </TableCell>
//                                         <TableCell>{item.membership.user.email}</TableCell>
//                                         <TableCell>123
//                                         </TableCell>
//                                         <TableCell><StatusChip status={item.status}/></TableCell>
//                                         <TableCell align="center">
//                                             <div className="flex">
// {/* 
//                                             {meeting.status === MeetingStatus.Scheduled && (
//                                                 item.status !== ParticipationStatus.Cancelled && (
//                                                 <ParticipantVacationModal
//                                                     user={item.user}
//                                                     circle={circle}
//                                                     meeting={meeting}
//                                                     participation={item}
//                                                 />

//                                             )
//                                             )}
//                                             {item.status === ParticipationStatus.Active && (
//                                                 <PayForParticipantModal
//                                                     participation={item}
//                                                     meeting={meeting}
//                                                     country={country}
//                                                     user={item.user}
//                                                     totalPaid={item.totalInMeetingCurrency}
//                                                 />
//                                             )} */}
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 )}
//                             </TableBody>
//                         </Table>
//                     </ModalBody>
//                 </ModalContent>
//             </Modal>
//         </main>
//     )
// }
// export default MeetingParticipantsModal