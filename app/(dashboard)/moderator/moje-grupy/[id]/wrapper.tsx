"use client"

import CreateMeetingModal from "@/components/moderator/create-meeting-modal";
import { faCalendar, faGears } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardBody, CardFooter, CardHeader, Divider } from "@heroui/react";
import { Group, GroupMeeting } from "@prisma/client";

const MyGroupWrapper = ({
    group,
    meetings
} : {
    group: Group
    meetings: GroupMeeting[]
}) => {
    return ( 
        <main className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <FontAwesomeIcon icon={faGears} className="mr-2"/> Ustawienia 
                </CardHeader>
            {JSON.stringify(group,null,2)}
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
                    <CreateMeetingModal
                        group={group}
                    />
                </CardFooter>
            </Card>
        </main>
     );
}
 
export default MyGroupWrapper;