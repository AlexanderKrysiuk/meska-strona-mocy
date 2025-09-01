"use client"

import { GetCircleMembersByCircleID } from "@/actions/member";
import { clientAuth } from "@/hooks/auth";
import { ModeratorQueries } from "@/utils/query";
import { Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User } from "@heroui/react";
import { Circle, CircleMembershipStatus } from "@prisma/client";
import { useQueries } from "@tanstack/react-query";

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

const CircleMembersTable = ({
    circles,
    circle
} : {
    circles : Circle[]
    circle? : Circle
}) => {
    const moderator = clientAuth()

    // Tworzymy tablicę zapytań – po jednym na każdy krąg
    const queries = useQueries({
        queries: circles.map((circle) => ({
            queryKey: [ModeratorQueries.CircleMembers, circle.id],
            queryFn: () => GetCircleMembersByCircleID(circle.id),
            enabled: !!moderator, // opcjonalnie możesz dodać też sprawdzenie, że circle.id istnieje
        })),
    });

    const allMembers = queries.flatMap(q => q.data || []);
    const isLoading = queries.some(q => q.isLoading);

    // Filtrujemy po wybranym kręgu jeśli jest selectedCircleId
    const displayedMembers = circle?.id 
        ? allMembers.filter(m => m.circleId === circle.id)
        : allMembers;

    const [CircleMembers] = queries
    
    return (
        <main>
            
            <div className="w-full overflow-x-auto p-2">
                <Table>
                    <TableHeader>
                        <TableColumn>Imię i Nazwisko</TableColumn>
                        <TableColumn>E-mail</TableColumn>
                        <TableColumn>Krąg</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn align="center">Akcje</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={displayedMembers}
                        isLoading={isLoading}
                        loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                        emptyContent={"Brak kręgowców"}
                    >
                        {(item) => (
                            <TableRow 
                                key={item.id}
                                className={item.status === CircleMembershipStatus.Active ? "" : "opacity-50"}
                            >
                                <TableCell>
                                    <User
                                        avatarProps={{
                                            showFallback: true,
                                            src: item.user.image!
                                        }}
                                        name={item.user.name ?? "Brak danych"}
                                    />
                                </TableCell>
                                <TableCell>{item.user.email}</TableCell>
                                <TableCell>{item.circle.name}</TableCell>
                                <TableCell><StatusChip status={item.status}/></TableCell>
                                <TableCell align="center">123</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <pre>
                {JSON.stringify(CircleMembers.data,null,2)}
            </pre>
        </main>
    );
}
 
export default CircleMembersTable;