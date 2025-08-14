"use client"

import AddCircleMemberModal from "@/components/moderator/add-circle-member-modal";
import CreateCircleModal from "@/components/moderator/create-circle-modal";
import { Divider, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { Circle, CircleMembership, User } from "@prisma/client";
import { useState } from "react";

const CircleMembersWrapper = ({
    users,
    memberships,
    circles
} : {
    users: Partial<User>[]
    memberships: CircleMembership[]
    circles: Circle[]
}) => {
    const [circleId, setCircleId] = useState<string | null>(null)

    const filteredUsers = users.filter(user => {
        const membership = memberships.find(m => m.userId === user.id);
        return !circleId || membership?.circleId === circleId;
    });
    

    return (
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Krąg"
                    items={circles}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    selectedKeys={[circleId!]}
                    onSelectionChange={(keys) => {
                        setCircleId(Array.from(keys)[0] as string)
                    }}
                    isDisabled={!circles}
                    hideEmptyContent
                >
                    {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                </Select>
                <CreateCircleModal/>
            </div>
            <Divider/>
            <div className="flex space-x-4 items-center">
                <h6 className="w-full">Kręgowcy</h6>
                <AddCircleMemberModal/>
            </div>
            <div className="w-full overflow-x-auto p-2">
                <Table
                    shadow="sm"
                >
                    <TableHeader>
                        <TableColumn>Imię i Nazwisko</TableColumn>
                        <TableColumn>E-mail</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Brak kręgowców"}>
                        {filteredUsers.map((user) => {
                            const membership = memberships.find(m => m.userId === user.id)
                            const circle = circles.find(c => c.id === membership?.circleId)
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name || "Brak danych"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{circle?.name}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <pre>
                USERS:{JSON.stringify(users,null,2)}
                CIRCLES: {JSON.stringify(circles,null,2)}
            </pre>
        </main>
    );
}
 
export default CircleMembersWrapper;