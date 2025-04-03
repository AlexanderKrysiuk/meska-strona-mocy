"use client"

import { fa1, fa2, fa3 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "@heroui/react";

type Meeting = {
    id: string
    startTime: Date;
    street: string;
    city: string;
    price: number;
    group: {
        moderator: {
            name: string | null;
            image: string | null;
        }
    }
}

const MeetingReservationWrapper = ({
    meeting
} : {
    meeting: Meeting
}) => {
    return (
        <main className="p-4 mx-auto max-w-2xl space-y-4">
            <div className="w-full flex">
                <h4>
                    Cześć, cieszę się, że chcesz dołączyć do Męskiego Kręgu!
                </h4>
                <Avatar
                    size="lg"
                    className="lg:w-24 lg:h-24"
                    showFallback
                    src={meeting.group.moderator.image!}
                    isBordered
                />
            </div>
            <p className="text-center">
                To przestrzeń, w której mężczyźni spotykają się, aby dzielić się doświadczeniami, wspierać i wzrastać. Nazywam się {meeting.group.moderator.name} i jestem moderatorem tego spotkania.
            </p>
            <h5 className="text-center">
                Co dalej?
            </h5>
            <div className="flex">
                <FontAwesomeIcon 
                    icon={fa1} 
                    size="2x"
                    className="mr-2 text-success" 
                />
                <p>
                    Przeczytaj i zaakceptuj regulamin
                </p>
            </div>
            <div className="flex">
                <FontAwesomeIcon 
                    icon={fa2}
                    size="2x"
                    className="mr-2 text-success"
                />
                <p>
                    Wypełnij formularz zgłoszeniowy
                </p>
            </div>
            <div className="flex">
                <FontAwesomeIcon
                    icon={fa3}
                    size="2x"
                    className="mr-2 text-success"
                />
                <p>
                    Dokonaj płatności za spotkanie
                </p>
            </div>
        <pre>
            {JSON.stringify(meeting, null,2)}
        </pre>
        </main>
    )   
}
export default MeetingReservationWrapper;