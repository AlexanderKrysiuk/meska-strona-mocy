"use client"

import { GetCirclesForLandingPage } from "@/actions/circle";
import Loader from "@/components/loader";
import { formatedDate } from "@/utils/date";
import { CircleQueries } from "@/utils/query";
import { faArrowRight, faCalendarDay, faChair, faCity, faGlobe, faRoad, faTicket, faTriangleExclamation, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { useInfiniteQuery } from "@tanstack/react-query";

// import { prisma } from "@/lib/prisma";
// import MensCircleWrapper from "./wrapper";
// import { CircleMembershipStatus } from "@prisma/client";

const MensCirclePage = () => {
    const PAGE_SIZE = 9

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: [CircleQueries.LandingPage],
        queryFn: async ({ pageParam = 0}) => GetCirclesForLandingPage(pageParam, PAGE_SIZE),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length === PAGE_SIZE ? allPages.length : undefined,
        initialPageParam: 0,
    })

    const circles = data?.pages.flat() ?? []

    if (isLoading) return <Loader/>

    return <main className="flex-col flex-grow lg:px-[20vw] p-4">
        <div className="py-4 space-y-4 grid gap-4 lg:grid-cols-3">
            {circles?.map((circle) => (
                <Card key={circle.id} className="relative">
                    <CardHeader className="bg-emerald-800 relative">
                        <h6 className="text-white">
                            {circle.name}
                        </h6>
                        <Avatar
                            size="lg"
                            src={circle.moderator.image!}
                            showFallback
                            isBordered
                            className="absolute top-3 right-3"
                        />
                    </CardHeader>
                    <CardBody>
                        <div>
                            <FontAwesomeIcon icon={faUserTie} className="mr-2"/>
                            Moderator: {circle.moderator.name}
                        </div>
                        {circle.city ? <div>
                            <FontAwesomeIcon icon={faRoad} className="mr-2"/>
                            Adres: {circle.street || "Miejsce nieustalone"}
                            <br/>
                            <FontAwesomeIcon icon={faCity} className="mr-2"/>
                            Miasto: {circle.city.name}
                        </div> : <div>
                            <FontAwesomeIcon icon={faGlobe} className="mr-2"/>
                            Krąg Online
                        </div>}
                        <div>
                            <FontAwesomeIcon icon={faTicket} className="mr-2"/>
                                Wkład energetyczny: {circle.price === circle.newUserPrice ? (
                                    circle.price
                                        ? <span> {circle.price} {circle.price}</span>
                                        : <span> spotkania bezpłatne </span>
                                ) : (
                                    <ul>
                                        <li>
                                            <FontAwesomeIcon icon={faArrowRight} className="ml-2"/>Pierwsze spotkanie: 
                                                {circle.newUserPrice
                                                    ? <span> {circle.newUserPrice} {circle.currency} </span>
                                                    : <span> bezpłatne </span>
                                                }
                                        </li>
                                        <li>
                                            <FontAwesomeIcon icon={faArrowRight} className="ml-2"/>Kolejne spotkania: 
                                                {circle.price
                                                    ? <span> {circle.price} {circle.currency} </span>
                                                    : <span> bezpłątne </span>
                                                } 
                                        </li>
                                    </ul>
                                )}
                        </div>
                        <div className={
                            (circle.maxMembers - circle._count.members) <= 2
                                ? "text-danger"
                                : (circle.maxMembers - circle._count.members) <= 4
                                    ? "text-warning"
                                    : "text-success"
                        }>
                            <FontAwesomeIcon icon={faChair} className="mr-2"/>
                            Wolne miejsca: {circle.maxMembers - circle._count.members}
                        </div>
                        <div>
                            {circle.meetings.length === 0 ? <div className="text-warning">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2"/>
                                Krąg w trakcie formowania, spotkania nie są jeszcze ustalone
                            </div> : <div>
                                Najbliższe spotkania kręgu:
                                <ul>
                                    {circle.meetings.map((meeting) => (
                                        <li key={meeting.id}>
                                            <FontAwesomeIcon icon={faCalendarDay} className="ml-2"/> {formatedDate(meeting.startTime, meeting.endTime, circle.city?.region.country.timeZone, "default", circle.city?.region.country.locale)}
                                        </li>
                                    ))}
                                </ul>
                            </div>}
                        </div>
                        {/* <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi malesuada, ipsum sed tempus vehicula, orci ex malesuada lacus, nec dapibus lorem erat at massa. Donec sit amet ligula quis velit varius egestas.
                        </p> */}
                    </CardBody>
                    <CardFooter>
                        {/* {JSON.stringify(circle,null,2)} */}
                    </CardFooter>
                </Card>
            ))}
        </div>
        <div className="w-full justify-center flex">

        <Button
            onPress={() => fetchNextPage()}
            isDisabled={isFetchingNextPage || !hasNextPage}
            isLoading={isFetchingNextPage}
            color="success"
            className="text-white"    
        >
            {isFetchingNextPage
                ? "Ładowanie..."
                : hasNextPage
                    ? "Załaduj więcej kręgów"
                    : "To już wszystkie kręgi"
            }
        </Button>
            </div>
        {/* <pre>
            {JSON.stringify(data,null,2)}
        </pre> */}
    </main>
}
 
export default MensCirclePage;