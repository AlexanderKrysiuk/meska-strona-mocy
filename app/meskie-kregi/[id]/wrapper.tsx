"use client"

import { RegisterSchema } from "@/schema/user";
import { fa1, fa2, fa3 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Checkbox, Form, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

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

type FormFields = z.infer<typeof RegisterSchema>

const MeetingReservationWrapper = ({
    meeting
} : {
    meeting: Meeting
}) => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }} = useForm<FormFields>({
        resolver: zodResolver(RegisterSchema)
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        console.log(data)
    }

    return (
        <main className="p-4 mx-auto max-w-2xl space-y-4">
            <div className="w-full flex">
                <h4>
                    Cześć, cieszę się, że chcesz dołączyć do Męskiego Kręgu!
                </h4>
                {meeting.group.moderator.image &&
                    <Avatar
                        size="lg"
                        className="lg:w-24 lg:h-24"
                        showFallback
                        src={meeting.group.moderator.image!}
                        isBordered
                    />
                }
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
            <Form onSubmit={handleSubmit(submit)}>
                <div className="flex">
                <Checkbox
                    isRequired={true}
                />
                <span>

                    Przeczytałem i akceptuję <Link href="/regulaminy" className="inline">wszystkie regulaminy oraz politykę prywatności</Link>, w szczególności <Link href="/regulaminy?meski-krag" className="inline">Regulamin uczestnictwa w Męskich Kręgach.</Link> Wyrażam zgodę na założenie konta użytkownika.
                </span>
                </div>
                <Input {...register("name")}
                    size="lg"
                    label="Imię i Nazwisko"
                    labelPlacement="outside"
                    type="text"
                    autoComplete="name"
                    placeholder="Jack Sparrow"
                    variant="bordered"
                    isClearable
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.name || !!errors.root}
                    errorMessage={errors.name?.message}
                />
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
                    errorMessage={errors.email?.message}
                />
                <Button
                    type="submit"
                    color="primary"
                    fullWidth
                    isDisabled={isSubmitting || !watch("name") || !watch("email")}
                    isLoading={isSubmitting}
                    className="text-white"
                >
                    {isSubmitting ? "Prztwarzanie..." : "Rezerwuj miejsce"}
                </Button>
            </Form>
        <pre>
            {JSON.stringify(meeting, null,2)}
        </pre>
        </main>
    )   
}
export default MeetingReservationWrapper;