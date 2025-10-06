"use client"

//import { clientAuth } from "@/hooks/auth";
import { formatedDate } from "@/utils/date";
import { PaymentQueries } from "@/utils/query";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { PayForMeetingButton } from "./pay-for-meeting-modal";
import { GetMyUnpaidParticipations } from "@/actions/participation";

const ShowUnpaidMeetingsTable = () => {
    //const auth = clientAuth()
    
    const { data: participations, isLoading } = useQuery({
        queryKey: [PaymentQueries.UnpaidMeetings],
        queryFn: () => GetMyUnpaidParticipations()
    })
    
    if (participations && participations.length === 0) return null

    return (
        <div className="space-y-4">
            <h6>Nieopłacone spotkania</h6>

                <Table shadow="sm">
                    <TableHeader>
                        <TableColumn>Data</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Ulica</TableColumn>
                        <TableColumn>Miasto</TableColumn>
                        <TableColumn>Płatność</TableColumn>
                        <TableColumn>Akcje</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={participations ?? []}
                        isLoading={isLoading}
                        loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                    >
                        {(item) => <TableRow key={item.id} className="text-danger">
                            <TableCell>{formatedDate(item.meeting.startTime, item.meeting.endTime, item.meeting.city.region.country.timeZone)}</TableCell>
                            <TableCell>{item.meeting.circle.name}</TableCell>
                            <TableCell>{item.meeting.street}</TableCell>
                            <TableCell>{item.meeting.city.name}</TableCell>
                            <TableCell>{item.amountPaid} / {item.meeting.price} {item.meeting.currency}</TableCell>
                            <TableCell>
                                <PayForMeetingButton
                                    meeting={item.meeting}
                                    country={item.meeting.city.region.country}
                                    circle={item.meeting.circle}
                                    participation={item}
                                />
                            </TableCell>
                        </TableRow>}
                    </TableBody>
                </Table>
        <pre>
            {JSON.stringify(participations,null,2)}
        </pre>
        </div> 
     );
}
 
export default ShowUnpaidMeetingsTable;