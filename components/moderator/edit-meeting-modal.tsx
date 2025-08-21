"use client"

import { EditMeeting } from "@/actions/meeting"
import { EditMeetingSchema } from "@/schema/meeting"
import { combineDateAndTime } from "@/utils/date"
import { faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDate, Time, getLocalTimeZone, parseAbsoluteToLocal, today } from "@internationalized/date"
import { City, Country, Circle, CircleMeeting, Region } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditMeetingModal = ({
    meeting,
    meetings,
    circle,
    countries,
    regions,
    cities
} : {
    meeting: CircleMeeting
    meetings: CircleMeeting[]
    circle: Circle
    countries: Country[]
    regions: Region[]
    cities: City[]
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

    // jutro
    const tomorrow = today(getLocalTimeZone()).add({ days: 1 });

    // data startowa z meeting.startTime
    const startDateFromMeeting = new CalendarDate(startZdt.year, startZdt.month, startZdt.day);

    // wybieramy wcześniejszą z nich
    const minDate = startDateFromMeeting.compare(tomorrow) < 0 ? startDateFromMeeting : tomorrow;
    
    const { handleSubmit, setError, setValue, watch, trigger, formState: { isSubmitting, errors, isValid, isDirty } } = useForm<FormFields>({
        resolver: zodResolver(EditMeetingSchema),
        mode: "all",
        defaultValues: {
            meetingId: meeting.id,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            street: meeting.street,
            cityId: meeting.cityId,
            price: meeting.price
        }
    })

    const city = cities.find(c => c.id === meeting.cityId)
    const region = regions.find(r => r.id === city?.regionId)
    const country = countries.find(c => c.id === region?.countryId)

    const cityId = watch("cityId")
    const [regionId, setRegionId] = useState<string | undefined>(region?.id)
    const [countryId, setCountryId] = useState<string | undefined>(country?.id)
    
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
        const result = await EditMeeting(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })

        if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
                setError(field as keyof FormFields, { message: messages.join(", ") })
            })
        } else {
            router.refresh()
            onClose()
        }
    }

    const {isOpen, onOpen, onClose} = useDisclosure()

    return (
        <main>
            <Tooltip
                color="primary"
                placement="top"
                content="Edytuj Spotkanie"
            >
                <Button
                    color="primary"
                    isIconOnly
                    onPress={onOpen}
                    variant="light"
                    radius="full"
                >
                    <FontAwesomeIcon icon={faPen}/>
                </Button>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <ModalHeader>Spotkanie Grupy: {circle.name}</ModalHeader>
                    {/* <Divider/>
                    <pre>

                        {JSON.stringify(watch(),null,2)}<br/>
                        {JSON.stringify(date,null,2)}
                        {JSON.stringify(startHour,null,2)}
                        {JSON.stringify(endHour,null,2)}
                        {JSON.stringify(regionId,null,2)}<br/>
                        {JSON.stringify(countryId,null,2)}<br/>
                        Valid: {JSON.stringify(isValid,null,2)}
                    </pre>
                    <Divider/> */}

                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <DatePicker
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                value={date}
                                isDateUnavailable={isDateUnavailable}
                                minValue={minDate}
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
                            <Select
                                label="Kraj"
                                labelPlacement="outside"
                                placeholder="Karaiby"
                                variant="bordered"
                                selectedKeys={[countryId!]}
                                onChange={(event) => {
                                    setCountryId(event.target.value)
                                    setRegionId(undefined)
                                    setValue("cityId", undefined!, {shouldValidate:true})
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                items={countries}
                            >
                                {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
                            </Select>
                            <Select
                                label="Województwo"
                                labelPlacement="outside"
                                placeholder="Archipelag Czarnej Perły"
                                variant="bordered"
                                selectedKeys={[regionId!]}
                                onChange={(event) => {
                                    setRegionId(event.target.value)
                                    setValue("cityId", undefined!, {shouldValidate: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting || !countryId}
                                items={regions.filter(region => region.countryId === countryId)}
                            >
                                {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                            </Select>
                            <Select
                                label="Miasto"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Isla de Muerta"
                                selectedKeys={[cityId]}
                                onChange={(event) => {
                                    setValue("cityId", event.target.value, {shouldValidate: true, shouldDirty: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting || !countryId || !regionId}
                                items={cities.filter(city => city.regionId === regionId)}
                            >
                                {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
                            </Select>
                            <Input
                                label="Adres (ulica, numer)"
                                labelPlacement="outside"
                                placeholder="Tortuga 13/7"
                                variant="bordered"
                                type="text"
                                value={watch("street")}
                                onValueChange={(value) => setValue("street", value, {shouldDirty: true, shouldValidate: true})}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.street}
                                errorMessage={errors.street?.message}
                            />
                            <NumberInput
                                label="Cena"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="150,00 zł"
                                minValue={0}
                                formatOptions={{
                                    style: "currency",
                                    currency: "PLN"
                                }}
                                value={watch("price")}
                                onValueChange={(value) => setValue("price", value, {shouldDirty:true, shouldValidate:true})}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.price}
                                errorMessage={errors.price?.message}                                        
                            />
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
                </ModalContent>
            </Modal>
        </main>
    )
}

export default EditMeetingModal;