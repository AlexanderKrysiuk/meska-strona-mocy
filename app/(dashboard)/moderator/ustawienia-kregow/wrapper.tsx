"use client"

import CreateCircleModal from "@/components/moderator/create-circle-modal"
import EditCircleForm from "@/components/moderator/edit-circle-form"
import { faGears } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Card, CardBody, CardHeader, Select, SelectItem } from "@heroui/react"
import { City, Country, Circle, Region } from "@prisma/client"
import { useState } from "react"

const CircleSettingsWrapper = ({
    circles,
    countries,
    regions,
    cities
} : {
    circles: Circle[]
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {

    const [circleId, setCircleId] = useState<Set<string>>(new Set())

    const selectedCircle = circles.find((g) => g.id === Array.from(circleId)[0])

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
                        // typ keys: Selection → domyślnie Set<string>
                        setCircleId(new Set(keys as Set<string>))
                    }}
                    hideEmptyContent
                    disallowEmptySelection
                    isDisabled={!circles}
                >
                    {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                </Select>
                <CreateCircleModal/>
            </div>
            <Card>
                <CardHeader>
                    <FontAwesomeIcon icon={faGears} className="mr-2"/> Ustawienia Kręgu: {selectedCircle?.name}
                </CardHeader>
                <CardBody>
                    <EditCircleForm
                        key={selectedCircle?.id}
                        circle={selectedCircle}
                        countries={countries}
                        regions={regions}
                        cities={cities}
                    />
                </CardBody>
            </Card>
        </main>
    )
}

export default CircleSettingsWrapper;