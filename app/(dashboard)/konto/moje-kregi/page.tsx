"use client"

import { GetMyMemberships } from "@/actions/membership";
import Loader from "@/components/loader";
import MembershipCardInside from "@/components/user/my-circles/membership-card-inside";
//import UnpaidMeetingsTable from "@/components/user/my-circles/unpaid-participations-table";
import { clientAuth } from "@/hooks/auth";
import { CircleQueries } from "@/utils/query";
import { Card, Divider, Select, SelectItem } from "@heroui/react";
//import { Membership } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
//import { useState } from "react";

const MyCirclesPage = () => {
    const auth = clientAuth()
    //const [setSelectedMembership] = useState<Pick<Membership, "id"> | undefined>()

    const { data: memberships, isLoading } = useQuery({
        queryKey: [CircleQueries.MyCircles, auth?.id],
        queryFn: () => GetMyMemberships()
    })

    const selectItems = [
        { id: "all", circle: { name: "Wszystkie" } }, // opcja Wszystkie
        ...(memberships ?? []), // reszta kręgów
    ];

    //const Loading = true
    if (isLoading) return <Loader/>

    return <main className="p-4 space-y-4">
        <div className="flex">
            {memberships?.map((membership) => (
                <Card 
                    key={membership.id}
                    //isHoverable
                    //isPressable
                    //onPress={() => setSelectedCircle(membership.id)}
                >
                    <MembershipCardInside
                        circle={membership.circle}
                        membership={membership}
                    />
                </Card>
            ))}
        </div>
        <Divider/>
        {memberships && memberships.length > 1 && <Select
            label="Krąg"
            items={selectItems}
            placeholder="Wybierz krąg"
            variant="bordered"
            // onSelectionChange={(keys) => {
            //     //const id = Array.from(keys)[0];
            //     //const membership = memberships?.find(m => m.id === id)
            //     //setSelectedMembership(membership)
            // }}
            isDisabled={!memberships}
            hideEmptyContent
            disallowEmptySelection
            defaultSelectedKeys={["all"]}
        >                  
            {(membership) => <SelectItem key={membership.id}>{membership.circle.name}</SelectItem>}
        </Select>}
        {/* <UnpaidMeetingsTable membership={selectedMembership}/> */}
        <Divider/>
        {/* <pre>
            WYBRANY MEMBERSHIP {JSON.stringify(selectedMembership,null,2)} <br/>
            {JSON.stringify(memberships, null ,2)}
        </pre> */}
    </main>

    // if (isLoading) return <Loader/>

    // if (!memberships || memberships.length === 0) return <main className="p-4 flex flex-col flex-1">
    //     <div className="text-center my-auto">
    //         Nie należysz jeszcze do żadnego aktywnego kręgu. <br/>
    //         <Link href="/meskie-kregi">
    //                 Kliknij tutaj aby dołączyć do kręgu
    //         </Link>      
    //     </div> 
    // </main>

    // return <main className="p-4 flex flex-col flex-1 space-y-4"> 
    //     <div className="flex gap-4 overflox-x-auto">
    //         {memberships.map((membership) => (
    //             <Card 
    //                 key={membership.id}    
    //             >
    //                 <CardHeader>{membership.circle.name}</CardHeader>
    //                 <CardBody>
    //                     <div>
    //                         Dostępne dni urlopowe: <strong>{membership.vacationDays}</strong>    
    //                     </div>
    //                 </CardBody>
    //             </Card>
    //         ))}
    //     </div>
    //     <Divider/>
    //     <ShowUnpaidMeetingsTable/>
    //     <pre>
    //         {JSON.stringify(memberships, null ,2)}
    //     </pre>
    // </main>;
}
 
export default MyCirclesPage;