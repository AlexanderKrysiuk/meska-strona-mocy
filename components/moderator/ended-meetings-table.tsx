"use client"

import { GetModeratorMeetings } from "@/actions/meeting"
import { clientAuth } from "@/hooks/auth"
import { formatedDate } from "@/utils/date"
import { ModeratorQueries } from "@/utils/query"
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { Circle, MeetingStatus } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

export const EndedMeetingsTable = ({
    circle
} : {
    circle?: Circle
}) => {
    const moderator = clientAuth()

    const { data: meetings, isLoading } = useQuery({
        queryKey: [ModeratorQueries.CompletedMeetings, moderator?.id],
        queryFn: () => GetModeratorMeetings(moderator!.id, MeetingStatus.Completed),
        enabled: !!moderator
    })

    const filteredMeetings = circle
        ? (meetings ?? []).filter(m => m.circle.id === circle.id)
        : meetings ?? []

    return <main>
        <h6>Zakończone spotkania</h6>
        <Table shadow="sm">
            <TableHeader>
                <TableColumn>Data</TableColumn>
                <TableColumn>Krąg</TableColumn>
                <TableColumn>Ulica</TableColumn>
                <TableColumn>Miasto</TableColumn>
                <TableColumn align="center">Akcje</TableColumn>
            </TableHeader>
            <TableBody
                items={filteredMeetings}
                isLoading={isLoading}
                loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                emptyContent={"Brak zakończonych spotkań"}
            >
                {(item) => (
                    <TableRow key={item.id}>
                        <TableCell>{formatedDate(item.startTime, item.endTime)}</TableCell>
                        <TableCell>{item.circle.name}</TableCell>
                        <TableCell>{item.street}</TableCell>
                        <TableCell>{item.city.name}</TableCell>
                        <TableCell className="flex justify-center">
                            Brak
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </main>
}