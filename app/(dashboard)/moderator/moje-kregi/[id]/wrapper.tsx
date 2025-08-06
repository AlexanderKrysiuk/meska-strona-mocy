"use client"

import EditcircleForm from "@/components/moderator/moje-kregi/edit-circle-form";
import { faCalendar, faGears } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardBody, CardFooter, CardHeader, Divider } from "@heroui/react";
import { City, Country, Circle, CircleMeeting, Region } from "@prisma/client";

const MycircleWrapper = ({
    circle,
    meetings,
    countries,
    regions,
    cities
} : {
    circle: Circle
    meetings: CircleMeeting[]
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    return ( 
        <main className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <FontAwesomeIcon icon={faGears} className="mr-2"/> Ustawienia 
                </CardHeader>
                <Divider/>
                <CardBody>
                    <EditcircleForm 
                        circle={circle}
                        countries={countries}
                        regions={regions}
                        cities={cities}
                    />
                </CardBody>
                <Divider/>
            </Card>
            <Card>
                <CardHeader>
                    <FontAwesomeIcon icon={faCalendar} className="mr-2"/> Nadchodzące spotkania
                </CardHeader>
                <CardBody>
                    {meetings.length > 0 ? (
                        meetings.map((meeting)=>(
                            <div key={meeting.id}>
                                {meeting.id} {meeting.startTime.toString()}
                                <Divider/>

                            </div>
                        ))
                    ) : (
                        <div className="w-full justify-center items-center">
                            Brak nadchodzących spotkań
                        </div>
                    )}
                </CardBody>
                <CardFooter>
                    
                </CardFooter>
            </Card>
        </main>
     );
}
 
export default MycircleWrapper;