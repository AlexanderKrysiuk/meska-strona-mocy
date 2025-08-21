"use client"

import { useState, useMemo } from "react";
import { Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Divider, User as HeroUser } from "@heroui/react";
import { Circle, CircleMembership, CircleMembershipStatus, User } from "@prisma/client";
import CreateCircleModal from "@/components/moderator/create-circle-modal";
import DeleteCircleMemberModal from "@/components/moderator/delete-circle-member-modal";
import AddCircleMemberModal from "@/components/moderator/add-circle-member-modal";
import RestoreUserToCircleModal from "@/components/moderator/restore-user-to-circle-modal";

type CirclesWithMembers = (Circle & {
    members: (CircleMembership & {
        user: Pick<User, "id" | "name" | "email" | "image">
    })[]
})[]

const StatusChip = ({ status }: { status: CircleMembershipStatus }) => {
    let color: "success" | "danger" | "default" = "default";
    let message: string = status;
  
    switch (status) {
      case CircleMembershipStatus.Active:
        color = "success";
        message = "Aktywny";
        break;
      case CircleMembershipStatus.Removed:
        color = "danger";
        message = "Usunięty";
        break;
      case CircleMembershipStatus.Left:
        color = "danger";
        message = "Opuścił";
        break;
    }
  
    return <Chip color={color} variant="dot">{message}</Chip>;
  };

const CircleMembersWrapper = ({ circlesWithMembers }: { circlesWithMembers: CirclesWithMembers }) => {
    const [circleId, setCircleId] = useState<string>();

    // Spłaszczamy wszystkich członków
    const allMembers = useMemo(() => 
        circlesWithMembers.flatMap(circle =>
            circle.members.map(m => ({
                membershipId: m.id,
                ...m.user,
                circleName: circle.name,
                circleId: circle.id,
                status: m.status,
            }))
        )
    , [circlesWithMembers]);

  // Filtrowanie po wybranym kręgu
    const filteredMembers = useMemo(() => 
        circleId ? allMembers.filter(m => m.circleId === circleId) : allMembers
    , [allMembers, circleId]);

  // Sortowanie po statusie – active na górze
    const sortedMembers = useMemo(() => 
        [...filteredMembers].sort((a, b) => {
            const activeStatus = CircleMembershipStatus.Active;
            if (a.status === activeStatus && b.status !== activeStatus) return -1;
            if (a.status !== activeStatus && b.status === activeStatus) return 1;
            return 0;
        })
    , [filteredMembers]);

    return (
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Krąg"
                    items={circlesWithMembers}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    selectedKeys={circleId ? [circleId] : []}
                    onSelectionChange={(keys) => setCircleId(Array.from(keys)[0] as string)}
                    hideEmptyContent
                    isDisabled={!circlesWithMembers}
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
                <Table>
                    <TableHeader>
                        <TableColumn>Imię i Nazwisko</TableColumn>
                        <TableColumn>E-mail</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Akcje</TableColumn>
                    </TableHeader>
                    <TableBody 
                        items={sortedMembers} 
                        emptyContent="Brak kręgowców"
                    >
                        {(item) => (
                            <TableRow 
                                key={item.membershipId}
                                className={item.status === CircleMembershipStatus.Active ? "" : "opacity-50"}    
                            >
                                <TableCell>
                                    <HeroUser
                                        avatarProps={{ 
                                            showFallback: true,
                                            src: item.image!
                                        }}
                                        name={item.name ?? "Brak danych"}
                                    />
                                </TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.circleName}</TableCell>
                                <TableCell><StatusChip status={item.status}/></TableCell>
                                <TableCell>
                                    {item.status === CircleMembershipStatus.Active && <DeleteCircleMemberModal membershipId={item.membershipId} memberName={item.name} circleName={item.circleName}/>}
                                    {item.status !== CircleMembershipStatus.Active && <RestoreUserToCircleModal member={{ id: item.id, name: item.name }} circle={{ id: item.circleId, name: item.circleName }}/>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </main>
    );
};

export default CircleMembersWrapper;
