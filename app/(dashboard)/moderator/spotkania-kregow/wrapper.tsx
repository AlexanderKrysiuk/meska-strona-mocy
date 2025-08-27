"use client"

import CompleteMeetingModal from "@/components/moderator/complete-meeting-modal";
import CreateCircleModal from "@/components/moderator/create-circle-modal";
import ShowMeetingMembersModal from "@/components/moderator/show-meeting-members-modal";
import { Divider, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { City, Circle, CircleMeeting, Country, Region, CircleMeetingStatus } from "@prisma/client";
import { useState } from "react";

const MeetingsWrapper = ({
    circles,
    meetings,
    countries,
    regions,
    cities
} : {
    circles: Circle[]
    meetings: CircleMeeting[]
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const [circleId, setCircleId] = useState<Set<string>>(new Set())

    //const selectedCircle = circles.find((circle) => circle.id === Array.from(circleId)[0])

    const scheduledMeetings = meetings
        .filter((m) => m.status === CircleMeetingStatus.Scheduled)
        .filter((m) => !circleId.size || m.circleId === Array.from(circleId)[0])
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const completedOrArchivedMeetings = meetings
        .filter((m) => m.status === CircleMeetingStatus.Completed || m.status === CircleMeetingStatus.Archived)
        .filter((m) => !circleId.size || m.circleId === Array.from(circleId)[0])
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    const circleMap = new Map(circles.map((g) => [g.id, g]));
    const cityMap = new Map(cities.map((c) => [c.id, c]));    

    return ( 
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Krąg"
                    items={circles}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    selectedKeys={circleId}
                    onSelectionChange={(keys) => {
                        setCircleId(new Set(keys as Set<string>))
                    }}
                    isDisabled={!circles}
                    hideEmptyContent
                >
                    {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                </Select>
                <CreateCircleModal/>
            </div>
            {/* <div>Krąg: {JSON.stringify(selectedCircle,null,2)}</div> */}
            <Divider/>
            <div className="flex space-x-4 items-center">
                <h6 className="w-full">Zaplanowane spotkania</h6>
                
            </div>
            <div className="w-full overflow-x-auto p-2">
                <Table 
                    shadow="sm"
                    className="min-w-[600px]"            
                >
                    <TableHeader>
                        <TableColumn>Data</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Ulica</TableColumn>
                        <TableColumn>Miasto</TableColumn>
                        <TableColumn align="center">Akcje</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Brak zaplanowanych spotkań"}>
                        {scheduledMeetings.map((meeting) => {
                            const circle = circleMap.get(meeting.circleId)!
                            const city = cityMap.get(meeting.cityId)

                            return (
                                <TableRow key={meeting.id}>
                                    <TableCell>
                                        {new Date(meeting.startTime).toLocaleDateString("pl-PL", {
                                            day: "2-digit", month: "2-digit", year: "numeric"
                                        })},{" "}
                                        {new Date(meeting.startTime).toLocaleTimeString("pl-PL", {
                                            hour: "2-digit", minute: "2-digit"
                                        })}{" - "}
                                        {new Date(meeting.endTime).toLocaleTimeString("pl-PL", {
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {circle?.name}
                                    </TableCell>
                                    <TableCell>
                                        {meeting.street}
                                    </TableCell>
                                    <TableCell>
                                        {city?.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-1 items-center justify-center">
                                            
                                            <CompleteMeetingModal
                                                meeting={meeting}
                                                circle={circle}
                                                countries={countries}
                                                regions={regions}
                                                cities={cities}
                                            />
                                            <ShowMeetingMembersModal
                                                meeting={meeting}
                                                circle={circle}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <h6>Zakończone spotkania</h6>
            <div className="w-full overflow-x-auto p-2">
                <Table
                    shadow="sm"
                    className="min-w-[600px]"  
                >
                    <TableHeader>
                        <TableColumn>Data</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Ulica</TableColumn>
                        <TableColumn>Miasto</TableColumn>
                    </TableHeader>
                    <TableBody 
                        emptyContent={"Brak zakończonych spotkań"}
                    >
                        {completedOrArchivedMeetings.map((meeting) => {
                            const circle = circleMap.get(meeting.circleId)
                            const city = cityMap.get(meeting.cityId)

                            return (
                                <TableRow key={meeting.id}>
                                    <TableCell>
                                        {new Date(meeting.startTime).toLocaleDateString("pl-PL", {
                                            day: "2-digit", month: "2-digit", year: "numeric"
                                        })},{" "}
                                        {new Date(meeting.startTime).toLocaleTimeString("pl-PL", {
                                            hour: "2-digit", minute: "2-digit"
                                        })}{" - "}
                                        {new Date(meeting.endTime).toLocaleTimeString("pl-PL", {
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {circle?.name}
                                    </TableCell>
                                    <TableCell>
                                        {meeting.street}
                                    </TableCell>
                                    <TableCell>
                                        {city?.name}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            {/* <pre>
            {JSON.stringify(completedOrArchivedMeetings,null,2)}            
            </pre>
            <Divider/>
            {JSON.stringify(meetings,null,2)}
            {JSON.stringify(countries,null,2)}
            {JSON.stringify(regions,null,2)}
            {JSON.stringify(cities,null,2)} */}
        </main>
     );
}
 
export default MeetingsWrapper;