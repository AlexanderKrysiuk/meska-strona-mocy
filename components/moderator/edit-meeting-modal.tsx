"use client"

import { EditMeetingSchema } from "@/schema/meeting"
import { combineDateAndTime } from "@/utils/date"
import { faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Divider, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDate, Time, getLocalTimeZone, parseAbsoluteToLocal, today } from "@internationalized/date"
import { Group, GroupMeeting } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditMeetingModal = ({
    meeting,
    meetings,
    group
} : {
    meeting: GroupMeeting
    meetings: GroupMeeting[]
    group: Group
}) => {
    const router = useRouter()

    type FormFields = z.infer<typeof EditMeetingSchema>

    //const [date, setDate] = useState<DateValue | null>(parseDate(meeting.startTime.toISOString().split("T")[0]))
    //const [startHour, setStartHour] = useState<TimeInputValue | null>()
    //const [endHour, setEndHour] = useState<TimeInputValue | null>()   

    // start
    const startZdt = parseAbsoluteToLocal(meeting.startTime.toISOString()); // ZonedDateTime w lokalnej strefie
    // end
    const endZdt   = parseAbsoluteToLocal(meeting.endTime.toISOString());
    
    // DatePicker: oczekuje DateValue — użyjemy CalendarDate (data BEZ czasu)
    const [date, setDate] = useState<DateValue | null>(
      new CalendarDate(startZdt.year, startZdt.month, startZdt.day)
    );
    
    // TimeInputValue: użyjemy Time (hh:mm)
    const [startHour, setStartHour] = useState<TimeInputValue | null>(
      new Time(startZdt.hour, startZdt.minute)
    );
    
    const [endHour, setEndHour] = useState<TimeInputValue | null>(
      new Time(endZdt.hour, endZdt.minute)
    );

    const { handleSubmit, setValue, watch, trigger, formState: { isSubmitting, errors, isValid, isDirty } } = useForm<FormFields>({
        resolver: zodResolver(EditMeetingSchema),
        mode: "all",
        defaultValues: {
            meetingId: meeting.id,
            startTime: meeting.startTime,
            endTime: meeting.endTime
        }
    })

    const disabledDates = useMemo(() => {
        return meetings
            .filter(m => m.id !== meeting.id) // <- pomijamy edytowane spotkanie
            .map(m => {
                const z = parseAbsoluteToLocal(m.startTime.toISOString()); // ZonedDateTime w lokalnej strefie
                return new CalendarDate(z.year, z.month, z.day); // tylko data (bez godziny)
                //parseDate(new Date(m.startTime).toISOString().split("T")[0])
            })
      }, [meetings, meeting.id])

    const isDateUnavailable = (date: DateValue) => {
        return disabledDates.some(disabled =>
            date.compare(disabled) === 0
        )
    }

    const submit: SubmitHandler<FormFields> = async (data) => {
        console.log(data)

        addToast({
            title: "Roboczy",
            color: "primary"
        })
        router.refresh()
    }

    const {isOpen, onOpen, onClose} = useDisclosure()

    return (
        <main>
            <Button
                color="primary"
                isIconOnly
                onPress={onOpen}
                variant="light"
                radius="full"
            >
                <FontAwesomeIcon icon={faPen}/>
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <ModalHeader>Spotkanie Grupy: {group.name}</ModalHeader>
                    <Divider/>
                        {JSON.stringify(watch(),null,2)}
                        {JSON.stringify(date,null,2)}
                        {JSON.stringify(startHour,null,2)}
                        {JSON.stringify(endHour,null,2)}
                    <Divider/>

                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <DatePicker
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                value={date}
                                isDateUnavailable={isDateUnavailable}
                                minValue={today(getLocalTimeZone()).add({days: 1})}
                                onChange={(date) => {
                                    setDate(date)
                                    if (date && startHour) setValue("startTime", combineDateAndTime(date, startHour), {shouldValidate: true, shouldDirty: true})
                                    if (date && endHour) setValue("endTime", combineDateAndTime(date, endHour), {shouldValidate: true, shouldDirty: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.startTime}
                                errorMessage={errors.startTime?.message}
                            />
                            <div className="flex space-x-4">
                                <TimeInput
                                    label="Godzina Rozpoczęcia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={startHour}
                                    onChange={(time) => {
                                        setStartHour(time)
                                        if (date && time) {
                                            setValue("startTime", combineDateAndTime(date, time), {shouldValidate: true, shouldDirty: true}) 
                                            trigger("endTime")
                                        }
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date}
                                />
                                <TimeInput
                                    label="Godzina Zakończenia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={endHour}
                                    onChange={(time) => {
                                        setEndHour(time)
                                        if (date && time) setValue("endTime", combineDateAndTime(date, time), {shouldValidate: true, shouldDirty: true})
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date || !startHour}
                                    isInvalid={!!errors.endTime}
                                    errorMessage={errors.endTime?.message}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting || !isValid || !isDirty} 
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Zmień dane spotkania"}
                            </Button>
                        </ModalFooter>
                    </Form>
                    <Divider/>
                    A tutaj tabela z grupą
                </ModalContent>
            </Modal>
        </main>
    )
}

export default EditMeetingModal;