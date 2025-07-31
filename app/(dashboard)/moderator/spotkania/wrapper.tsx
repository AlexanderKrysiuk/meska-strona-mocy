"use client"

import CreateGroupModal from "@/components/moderator/create-group-modal";
import CreateMeetingModal from "@/components/moderator/create-meeting-modal";
import EditMeetingModal from "@/components/moderator/edit-meeting-modal";
import { Divider, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { City, Country, Group, GroupMeeting, Region } from "@prisma/client";
import { useState } from "react";

const MeetingsWrapper = ({
    groups,
    meetings,
    countries,
    regions,
    cities
} : {
    groups: Group[]
    meetings: GroupMeeting[]
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const [groupId, setGroupId] = useState<Set<string>>(new Set())

    const selectedGroup = groups.find((group) => group.id === Array.from(groupId)[0])

    const now = new Date()

    const upcomingMeetings = meetings
        .filter((m) => new Date(m.startTime) > now)
        .filter((m) => !groupId.size || m.groupId === Array.from(groupId)[0])
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const pastMeetings = meetings
        .filter((m) => new Date(m.endTime) < now)
        .filter((m) => !groupId.size || m.groupId === Array.from(groupId)[0])
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    const groupMap = new Map(groups.map((g) => [g.id, g]));
    const cityMap = new Map(cities.map((c) => [c.id, c]));    

    return ( 
        <main className="p-4 space-y-4">
            <Select
                label="Grupa"
                items={groups}
                placeholder="Wybierz grupę"
                variant="bordered"
                selectedKeys={groupId}
                onSelectionChange={(keys) => {
                    setGroupId(new Set(keys as Set<string>))
                }}
            >
                {(group) => <SelectItem key={group.id}>{group.name}</SelectItem>}
            </Select>
            <div>Grupa: {JSON.stringify(selectedGroup,null,2)}</div>
            <div className="flex space-x-4">
                <CreateGroupModal/>
                <CreateMeetingModal
                    groups={groups}
                    meetings={meetings}
                    selectedGroup={selectedGroup}
                    countries={countries}
                    regions={regions}
                    cities={cities}
                />
            </div>
            <Divider/>
            <h6>Nadchodzące spotkania</h6>
            <div className="w-full overflow-x-auto p-2">
                <Table 
                    shadow="sm"
                    className="min-w-[600px]"            
                >
                    <TableHeader>
                        <TableColumn>Data</TableColumn>
                        <TableColumn>Grupa</TableColumn>
                        <TableColumn>Ulica</TableColumn>
                        <TableColumn>Miasto</TableColumn>
                        <TableColumn>Akcje</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Brak nadchodzących spotkań"}>
                        {upcomingMeetings.map((meeting) => {
                            const group = groupMap.get(meeting.groupId)!
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
                                        {group?.name}
                                    </TableCell>
                                    <TableCell>
                                        {meeting.street}
                                    </TableCell>
                                    <TableCell>
                                        {city?.name}
                                    </TableCell>
                                    <TableCell>
                                        <EditMeetingModal
                                            meeting={meeting}
                                            meetings={meetings}
                                            group={group}
                                            countries={countries}
                                            regions={regions}
                                            cities={cities}
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <h6>Nadchodzące spotkania</h6>



                        <pre>

{JSON.stringify(pastMeetings,null,2)}            
                        </pre>
            <Divider/>
            {JSON.stringify(meetings,null,2)}
            {JSON.stringify(countries,null,2)}
            {JSON.stringify(regions,null,2)}
            {JSON.stringify(cities,null,2)}
        </main>
     );
}
 
export default MeetingsWrapper;