"use client"

import { GetMyMemberships } from "@/actions/membership";
import Loader from "@/components/loader";
import ShowUnpaidMeetingsTable from "@/components/user/unpaid-participations-table";
import { CircleQueries } from "@/utils/query";
import { Card, CardBody, CardHeader, Divider, Link } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

const MyCirclesPage = () => {
    const { data: memberships, isLoading } = useQuery({
        queryKey: [CircleQueries.MyCircles],
        queryFn: () => GetMyMemberships()
    })

    if (isLoading) return <Loader/>

    if (!memberships || memberships.length === 0) return <main className="p-4 flex flex-col flex-1">
        <div className="text-center my-auto">
            Nie należysz jeszcze do żadnego aktywnego kręgu. <br/>
            <Link href="/meskie-kregi">
                    Kliknij tutaj aby dołączyć do kręgu
            </Link>      
        </div> 
    </main>

    return <main className="p-4 flex flex-col flex-1 space-y-4"> 
        <div className="flex gap-4 overflox-x-auto">
            {memberships.map((membership) => (
                <Card 
                    key={membership.id}    
                >
                    <CardHeader>{membership.circle.name}</CardHeader>
                    <CardBody>
                        <div>
                            Dostępne dni urlopowe: <strong>{membership.vacationDays}</strong>    
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
        <Divider/>
        <ShowUnpaidMeetingsTable/>
        <pre>
            {JSON.stringify(memberships, null ,2)}
        </pre>
    </main>;
}
 
export default MyCirclesPage;