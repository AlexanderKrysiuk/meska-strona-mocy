"use client"

import { GetModeratorCircles } from "@/actions/circle";
import { ModeratorQueries } from "@/utils/query";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import EditCircleModal from "./edit-circle-modal";
import { useMemo } from "react";


const CirclesTable = () => {
    const { data: session } = useSession()
    const user = session?.user.id

    const { data: circles, isLoading } = useQuery({
        queryKey: [ModeratorQueries.Circles, session?.user.id],
        queryFn: () => GetModeratorCircles(user!),
        enabled: !!session?.user
    })

    // const MobileRows = circles?.flatMap((circle, index) => [
    //     { id: `${circle.id}-${circle.name}`, label: "Nazwa", value: circle.name, index },
    //     { id: `${circle.id}-Actions`, label: "Akcje", value: <><EditCircleModal circle={circle}/></>, index}
    // ])

    const MobileRows = useMemo(() => {
        if (!circles) return [];
        return circles.flatMap((circle, index) => [
          { id: `${circle.id}-${circle.name}`, label: "Nazwa", value: circle.name, index },
          { id: `${circle.id}-Actions`, label: "Akcje", value: <EditCircleModal circle={circle} />, index },
        ]);
      }, [circles]);


    return <main>
        
        <Table
            hideHeader
            shadow="sm"
            aria-label="Męskie Kręgi"
        >
            <TableHeader>
                <TableColumn>Opis</TableColumn>
                <TableColumn>Dane</TableColumn>
            </TableHeader>
            <TableBody
                items={MobileRows}
                isLoading={isLoading}
                loadingContent={
                    <Spinner 
                        label="Ładowanie danych" 
                        variant="wave"
                    />
                }
                emptyContent={"Brak kręgów"}
            >
                {(item) => 
                    <TableRow key={item.id} className={item.index % 2 === 0 ? "" : "bg-foreground-100"}                    >
                        <TableCell className="">{item.label}</TableCell>
                        <TableCell className="">{item.value}</TableCell>
                    </TableRow>
                }
            </TableBody>
        </Table>
        {/* <pre>

        {JSON.stringify(circles,null,2)}
        </pre> */}
    </main>;
}
 
export default CirclesTable;