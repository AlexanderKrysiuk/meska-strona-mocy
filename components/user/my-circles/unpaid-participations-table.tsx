"use client"

//import { clientAuth } from "@/hooks/auth";
import { formatedDate } from "@/utils/date";
import { UserQueries } from "@/utils/query";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
//import { PayForMeetingButton } from "../pay-for-meeting-modal";
import { GetParticipationsByUserId } from "@/actions/participation";
import { clientAuth } from "@/hooks/auth";
import { Membership } from "@prisma/client";

const UnpaidMeetingsTable = ({
    membership
} : {
    membership?: Pick<Membership, "id">
}) => {
    const auth = clientAuth()
    
    const { data: participations, isLoading } = useQuery({
        queryKey: [UserQueries.Participations],
        queryFn: () => GetParticipationsByUserId(auth!.id),
        enabled: !!auth!.id
    })

    const filteredParticipations = membership
    ? participations?.filter(p => p.membership.id === membership.id)
    : participations

    const unpaidParticipations = filteredParticipations?.map(p => {
        const amountPaid = p.payments
            .filter(pay => pay.currency === p.meeting.currency)
            .reduce((sum, pay) => sum + pay.amount, 0);

        return { ...p, amountPaid };
    }).filter(p => p.amountPaid < p.meeting.price); // tylko nieopłacone / częściowo opłacone
    
    return (
        <div className="space-y-4">
            <h6>Nieopłacone spotkania</h6>

                <Table 
                    shadow="sm"
                    isCompact
                >
                    <TableHeader>
                        <TableColumn>Data</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Ulica</TableColumn>
                        <TableColumn>Miasto</TableColumn>
                        <TableColumn>Płatność</TableColumn>
                        <TableColumn>Akcje</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={unpaidParticipations ?? []}
                        isLoading={isLoading}
                        loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                        emptyContent={<strong className="text-success">Wszystkie spotkania opłacone 🙂</strong>}
                    >
                        {(item) => <TableRow key={item.id} className="text-danger">
                            <TableCell>{formatedDate(item.meeting.startTime, item.meeting.endTime, item.meeting.city.region.country.timeZone)}</TableCell>
                            <TableCell>{item.meeting.circle.name}</TableCell>
                            <TableCell>{item.meeting.street}</TableCell>
                            <TableCell>{item.meeting.city.name}</TableCell>
                            <TableCell>{item.amountPaid} / {item.meeting.price} {item.meeting.currency}</TableCell>
                            <TableCell>
                                123
                            </TableCell>
                        </TableRow>}
                    </TableBody>
                </Table>
        {/* <pre>
            {JSON.stringify(participations,null,2)}
        </pre> */}
        </div> 
     );
}
 
export default UnpaidMeetingsTable;