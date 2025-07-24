"use client"

import CreateGroupModal from "@/components/moderator/create-group-modal"
import EditGroupForm from "@/components/moderator/moje-grupy/edit-group-form"
import { faGears } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Card, CardBody, CardHeader, Select, SelectItem } from "@heroui/react"
import { City, Country, Group, Region } from "@prisma/client"
import { useState } from "react"

const GroupSettingsWrapper = ({
    groups,
    countries,
    regions,
    cities
} : {
    groups: Group[]
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {

    const [groupId, setGroupId] = useState<Set<string>>(new Set())

    const selectedGroup = groups.find((g) => g.id === Array.from(groupId)[0])

    return (
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Grupa"
                    items={groups}
                    placeholder="Wybierz grupę"
                    variant="bordered"
                    selectedKeys={groupId}
                    onSelectionChange={(keys) => {
                        // typ keys: Selection → domyślnie Set<string>
                        setGroupId(new Set(keys as Set<string>))
                    }}
                >
                    {(group) => <SelectItem key={group.id}>{group.name}</SelectItem>}
                </Select>
                <CreateGroupModal/>
            </div>
            <Card>
                <CardHeader>
                    <FontAwesomeIcon icon={faGears} className="mr-2"/> Ustawienia Grupy: {selectedGroup?.name}
                </CardHeader>
                <CardBody>
                    <EditGroupForm
                        key={selectedGroup?.id}
                        group={selectedGroup}
                        countries={countries}
                        regions={regions}
                        cities={cities}
                    />
                </CardBody>
            </Card>
        </main>
    )
}

export default GroupSettingsWrapper;