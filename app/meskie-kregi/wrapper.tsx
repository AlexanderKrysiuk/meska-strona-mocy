"use client"

import Footer from "@/components/footer";
import { faCalendar, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { group } from "console";

type Meeting = {
    id: string;
    startTime: Date;
    city: string;
    street: string;
    price: number;
    group: {
        name: string;
        _count: { members: number };
        moderator: { name: string | null; image: string | null };
    };
};

const MensCircleWrapper = ({
    meetings
} : {
    meetings: Meeting[]
}) => {
    return ( 
        <main className="p-4 mx-auto max-w-2xl">
            {meetings.length > 0 ? (
                meetings.map((meeting)=>
                    <Card
                        key={meeting.id}
                    >
                        <CardHeader
                            className="bg-emerald-800 text-white"
                        >
                            Spotkanie grupy {meeting.group.name}
                            {//meeting.group.moderator.image &&
                                <Avatar
                                    className="absolute right-4 top-4 lg:w-20 lg:h-20"
                                    size="lg"
                                    showFallback
                                    src={meeting.group.moderator.image}
                                    isBordered
                            />
                            }
                        </CardHeader>
                        <CardBody
                            className="bg-emerald-600 text-white"
                        >
                            <div>
                                <FontAwesomeIcon icon={faUserTie} className="mr-2"/>
                                Prowadzący: {meeting.group.moderator.name}
                            </div>
                            <div className="flex justify-start items-center">

                            <FontAwesomeIcon icon={faCalendar} className="mr-2"/>
                            Data: {meeting.startTime.toUTCString()}
                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button>
                                Zapisuję się
                            </Button>
                        </CardFooter>
                    </Card>
                )
            ) : (
                <div className="flex justify-center items-center">
                    Brak dostępnych spotkań na chwilę obecną
                </div>
            )}
            <pre>

            {JSON.stringify(meetings, null,2)}
            </pre>
        </main>
     );
}
 
export default MensCircleWrapper;