"use client"

import AddCircleMemberModal from "@/components/moderator/add-circle-member-modal";
import CreateCircleModal from "@/components/moderator/create-circle-modal";
import DeleteCircleMemberModal from "@/components/moderator/delete-circle-member-modal";
import { Divider, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { Circle, CircleMembership, User } from "@prisma/client";
import { useState } from "react";

type CirclesWithMembers = (Circle & {
    members: (CircleMembership & {
        user: Pick<User, "id" | "name" | "email">
    })[]
})[]  

const CircleMembersWrapper = ({
    circlesWithMembers
} : {
    circlesWithMembers: CirclesWithMembers
}) => {
    const [circleId, setCircleId] = useState<string>()

    // Wszystkie memberships spłaszczone do listy użytkowników z info o kręgu
    const allMembers = circlesWithMembers.flatMap(circle =>
        circle.members.map(m => ({
            membershipId: m.id,       // <- używamy id łącznika
            ...m.user,
            circleName: circle.name,
            circleId: circle.id,
            status: m.status
        }))
    )  

    // Filtrowanie po wybranym kręgu
    const filteredMembers = circleId
        ? allMembers.filter(m => m.circleId === circleId)
        : allMembers;    

    return (
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Krąg"
                    items={circlesWithMembers}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    selectedKeys={[circleId!]}
                    onSelectionChange={(keys) => {
                        setCircleId(Array.from(keys)[0] as string)
                    }}
                    isDisabled={!circlesWithMembers}
                    hideEmptyContent
                >
                    {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                </Select>
                <CreateCircleModal/>
            </div>
            <Divider/>
            <div className="flex space-x-4 items-center">
                <h6 className="w-full">Kręgowcy</h6>
                <AddCircleMemberModal
                    defaultCircleId={circleId}
                    circles={circlesWithMembers}
                />
            </div>
            <div className="w-full overflow-x-auto p-2">
                <Table
                    shadow="sm"
                >
                    <TableHeader>
                        <TableColumn>Imię i Nazwisko</TableColumn>
                        <TableColumn>E-mail</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Akcje</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Brak kręgowców"} items={filteredMembers}>
                        {(item) => (
                            <TableRow key={item.membershipId}>
                                <TableCell>{item.name || "Brak danych"}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.circleName}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell><DeleteCircleMemberModal membershipId={item.membershipId} memberName={item.name!} circleName={item.circleName} /></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <pre>
                {JSON.stringify(circlesWithMembers,null,2)}
            </pre>
        </main>
    );
}
 
export default CircleMembersWrapper;