"use client"

import { formatDate } from "@/lib/format";
import { RegisterToMeetingSchema } from "@/schema/meeting";
import { faCalendar, faCity, faMoneyBill, faPeopleGroup, faRoad, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Meeting = {
    id: string;
    startTime: Date;
    city: string;
    street: string;
    price: number;
    group: {
        name: string;
        maxMembers: number;
        _count: { members: number };
        moderator: { name: string | null; image: string | null };
    };
};

type FormFields = z.infer<typeof RegisterToMeetingSchema>

const MensCircleWrapper = ({
    meetings
} : {
    meetings: Meeting[]
}) => {
    const { formState: { } } = useForm<FormFields>({
        resolver: zodResolver(RegisterToMeetingSchema)
    })

    //const submit: SubmitHandler<FormFields> = async(data) => {
    //    try {
    //        console.log(data)
    //    } catch(error) {
    //        setError("root", {message: error instanceof Error ? error.message : "Wystąpił nieznany błąd"})
    //    }
    //}


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
                                    src={meeting.group.moderator.image!}
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
                                Data: {formatDate(meeting.startTime)}
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faRoad} className="mr-2"/>
                                Adres: {meeting.street}
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faCity} className="mr-2"/>
                                Miasto: {meeting.city}
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faMoneyBill} className="mr-2"/>
                                Cena: {meeting.price}
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faPeopleGroup} className="mr-2"/>
                                <span className={meeting.group.maxMembers - meeting.group._count.members < 5 ? "text-danger" : ""}>
                                    Wolne miejsca: {meeting.group.maxMembers - meeting.group._count.members}
                                </span>
                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button
                                as={Link}
                                href={`meskie-kregi/${meeting.id}`}
                                variant="light"
                                size="lg"
                                fullWidth
                                color="success"
                            >
                                Zarezerwuj miejsce
                            </Button>

                            {/*
                            <Form onSubmit={handleSubmit(submit)}
                                className="w-full lg:flex lg:flex-row items-end"
                            >

                                <Input {...register("email")}
                                    label="Email"
                                    labelPlacement="outside"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="jack.sparrow@piratebay.co.uk"
                                    variant="bordered"
                                    isClearable
                                    isRequired
                                    isDisabled={isSubmitting}
                                    isInvalid={!!errors.email || !!errors.root}
                                    errorMessage={errors.email?.message || errors.root?.message}
                                />
                                <Button
                                    type="submit"
                                    color="primary"
                                    className="w-full lg:w-auto"
                                    isDisabled={isSubmitting || !watch("email")}
                                >
                                    {isSubmitting ? "Przetwarzanie..." : "Dołączam"}
                                </Button>
                            </Form>
                            */}
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