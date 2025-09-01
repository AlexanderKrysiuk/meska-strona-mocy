"use client"

import { useQuery } from "@tanstack/react-query";
import { clientAuth } from "@/hooks/auth";
import { GetModeratorCircles } from "@/actions/circle";
import { useState } from "react";
import { Divider, Select, SelectItem } from "@heroui/react";
import CreateCircleModal from "@/components/moderator/create-circle-modal";
import { ModeratorQueries } from "@/utils/query";
import { CreateMeetingModal } from "@/components/moderator/create-meeting-modal";
import Loader from "@/components/loader";
import { Circle } from "@prisma/client";
import { ScheduledMeetingsTable } from "@/components/moderator/scheduled-meetings-table";

const MeetingsPage = () => {
    const [selectedCircle, setSelectedCircle] = useState<Circle | undefined>()

    const moderator = clientAuth()

    const { data: circles } = useQuery({
        queryKey: [ModeratorQueries.Circles, moderator?.id],
        queryFn: () => GetModeratorCircles(moderator!.id),
        enabled: !!moderator
    })

    if (!circles) return <Loader/>


    // const queries = useQueries({
    //     queries: [
    //         { queryKey: ["moderator-circles", moderator?.id], queryFn: () => GetModeratorCircles(moderator!.id), enabled: !!moderator},
    //         { queryKey: ["cities"], queryFn: GetCities, enabled: !!moderator },
    //         { queryKey: ["regions"], queryFn: GetRegions, enabled: !!moderator },
    //         { queryKey: ["countries"], queryFn: GetCountries, enabled: !!moderator },
    //         { queryKey: ["moderator-scheduled-meetings", moderator?.id], queryFn: () => GetScheduledMeetingsByModeratorID(moderator!.id), enabled: !!moderator },
    //         { queryKey: ["moderator-completed-meetings", moderator?.id], queryFn: () => GetCompletedMeetingsByModeratorID(moderator!.id), enabled: !!moderator }
    //     ]
    // });

    // przypisanie wyników do zmiennych
    // const [circlesQuery, citiesQuery, regionsQuery, countriesQuery, scheduledMeetingsQuery, completedMeetingsQuery] = queries;

    // const circles = circlesQuery.data
    // const cities = citiesQuery.data;
    // const regions = regionsQuery.data;
    // const countries = countriesQuery.data;
    // const scheduledMeetings = scheduledMeetingsQuery.data;
    // const completedMeetings = completedMeetingsQuery.data;

    // loading
    //const loading = queries.some(q => q.isLoading);


    return (
        <main className="p-4 space-y-4">
            <div className="flex space-x-4 items-center">
                <Select
                    label="Krąg"
                    items={circles}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    onSelectionChange={(keys) => {
                        const id = Array.from(keys)[0];
                        const circle = circles.find(c => c.id === id);
                        setSelectedCircle(circle); 
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
                <h6 className="w-full">Zaplanowane spotkania</h6>
                <CreateMeetingModal circle={selectedCircle}/>
            </div>
            <ScheduledMeetingsTable
                circle={selectedCircle}
            />
            <Divider/>
            <pre>
                {/* {JSON.stringify(selectedCircle,null,2)} */}
            </pre>
                {/* <pre>{JSON.stringify(circles,null,2)}</pre> */}
        </main>
    )
}


// const MeetingsPage = async () => {
//     const user = await CheckLoginOrRedirect()

//     if (!PermissionGate(user.roles, [Role.Moderator])) return redirect("/")

//     const circles = await prisma.circle.findMany({
//         where: {
//             moderatorId: user.id
//         }
//     })

//     const circlesIds = circles.map(circle => circle.id)

//     const meetings = await prisma.circleMeeting.findMany({
//         where: {
//             circleId: {
//                 in: circlesIds
//             }
//         },
//         orderBy: {
//             startTime: "asc"
//         }
//     })

//     const countries = await prisma.country.findMany()
//     const regions = await prisma.region.findMany()
//     const cities = await prisma.city.findMany()

//     return  <MeetingsWrapper 
//                 circles={circles} 
//                 meetings={meetings} 
//                 countries={countries} 
//                 regions={regions} 
//                 cities={cities}            
//             />
// }
 
export default MeetingsPage;