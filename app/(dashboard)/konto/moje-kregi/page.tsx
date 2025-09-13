"use client"

import { QueryGetMyCircleMemberships } from "@/actions/member";
import Loader from "@/components/loader";
import ShowUnpaidMeetingsTable from "@/components/user/show-unpaid-meetings-table";
import { clientAuth } from "@/hooks/auth";
import { CircleQueries } from "@/utils/query";
import { Card, CardBody, CardHeader, Divider, Link } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

const MyCirclesPage = () => {
    const auth = clientAuth()

    const { data: circles, isLoading } = useQuery({
        queryKey: [CircleQueries.MyCircles, auth?.id],
        queryFn: () => QueryGetMyCircleMemberships(auth!.id),
        enabled: !!auth?.id
    })

    if (isLoading) return <Loader/>

    if (!circles || circles.length === 0) return <main className="p-4 flex flex-col flex-1">
        <div className="text-center my-auto">
            Nie należysz jeszcze do żadnego aktywnego kręgu. <br/>
            <Link href="/meskie-kregi">
                    Kliknij tutaj aby dołączyć do kręgu
            </Link>      
        </div> 
    </main>

    return <main className="p-4 flex flex-col flex-1 space-y-4"> 
        <div className="flex gap-4 overflox-x-auto">
            {circles.map((circle) => (
                <Card key={circle.id}>
                    <CardHeader>{circle.circle.name}</CardHeader>
                    <CardBody>
                        <div>
                            Dostępne dni urlopowe: <strong>{circle.vacationDays}</strong>    
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
        <Divider/>
        <ShowUnpaidMeetingsTable/>
        <pre>
            {JSON.stringify(circles, null ,2)}
        </pre>
    </main>;
}
 
export default MyCirclesPage;