"use client"

import { GetModeratorMeetingsByModeratorID } from "@/actions/meeting"
import { clientAuth } from "@/hooks/auth"
import { formatShortDate } from "@/utils/date"
import { ModeratorQueries } from "@/utils/query"
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { Circle, CircleMeetingStatus } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { EditMeetingModal } from "./edit-meeting-modal"

export const ScheduledMeetingsTable = ({
    circle
} : {
    circle?: Circle
}) => {
    const moderator = clientAuth()

    const { data: meetings, isLoading } = useQuery({
        queryKey: [ModeratorQueries.ScheduledMeetings, moderator?.id],
        queryFn: () => GetModeratorMeetingsByModeratorID(moderator!.id, CircleMeetingStatus.Scheduled),
        enabled: !!moderator
    })

    //if (isLoading) return null

    return <main>
        <Table
            shadow="sm"
        >
            <TableHeader>
                <TableColumn>Data</TableColumn>
                <TableColumn>Krąg</TableColumn>
                <TableColumn>Ulica</TableColumn>
                <TableColumn>Miasto</TableColumn>
                <TableColumn>Akcje</TableColumn>
            </TableHeader>
            <TableBody
                items={meetings ?? []}
                isLoading={isLoading}
                loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                emptyContent={"Brak planowanych spotkań"}
            >
                {(item) => (
                    <TableRow key={item.id}>
                        <TableCell>{formatShortDate(item.startTime, item.endTime, item.city.region.country.locale)}</TableCell>
                        <TableCell>{item.circle.name}</TableCell>
                        <TableCell>{item.street}</TableCell>
                        <TableCell>{item.city.name}</TableCell>
                        <TableCell>
                            <EditMeetingModal
                                meeting={item}
                                circle={item.circle}
                                country={item.city.region.country}
                            />
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
        <pre>
            {/* {JSON.stringify(meetings,null,2)} */}
            {JSON.stringify(circle,null,2)}
        </pre>
    </main>
}