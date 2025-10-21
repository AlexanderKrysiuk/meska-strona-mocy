"use client"

import { GetMembershipBalanceByUserID } from "@/actions/balance";
import { clientAuth } from "@/hooks/auth";
import { UserQueries } from "@/utils/query";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { Membership } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

const UnusedBalanceTable = ({
    membership
} : {
    membership?: Pick<Membership, "id">
}) => {
    const auth = clientAuth()

    const { data: balance, isLoading } = useQuery({
        queryKey: [UserQueries.Balance, auth?.id],
        queryFn: () => GetMembershipBalanceByUserID(auth!.id),
        enabled: !!auth!.id
    })

    const filteredBalance = membership
    ? balance?.filter(b => b.membership.id === membership.id)
    : balance;
    
    return <main className="space-y-4">
        <h6>Niewykorzystane środki</h6>
        <Table
            shadow="sm"
            isCompact
        >
            <TableHeader>
                <TableColumn>Ilość</TableColumn>
                <TableColumn>Waluta</TableColumn>
                <TableColumn>Metoda Płatności</TableColumn>
                <TableColumn>Krąg</TableColumn>
                <TableColumn>Akcje</TableColumn>
            </TableHeader>
            <TableBody
                items={filteredBalance || []}
                isLoading={isLoading}
                loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                emptyContent={"Brak niewykorzystanych środków"}
            >
                {(item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>{item.currency}</TableCell>
                        <TableCell>{item.method ?? "Brak informacji"}</TableCell>
                        <TableCell>{item.membership.circle.name}</TableCell>
                        <TableCell>{"Brak Akcji"}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
        {/* <pre>
            {JSON.stringify(balance,null,2)}
        </pre> */}
    </main>;
}
 
export default UnusedBalanceTable;