"use client"

import CreateGroupModal from "@/components/moderator/create-group-modal";
import CreateMeetingModal from "@/components/moderator/create-meeting-modal";
import { Select, SelectItem } from "@heroui/react";
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
                    selectedGroup={selectedGroup}
                />
                {JSON.stringify(meetings,null,2)}
                {JSON.stringify(countries,null,2)}
                {JSON.stringify(regions,null,2)}
                {JSON.stringify(cities,null,2)}
            </div>
        </main>
     );
}
 
export default MeetingsWrapper;