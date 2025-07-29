"use client"

import { CreateMeeting } from "@/actions/meeting";
import { CreateMeetingSchema } from "@/schema/meeting";
import { combineDateAndTime } from "@/utils/date";
import { liveNameify, numberify } from "@/utils/slug";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { City, Country, Group, GroupMeeting, Region } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const CreateMeetingModal = ({
    groups,
    meetings,
    selectedGroup,
    countries,
    regions,
    cities
} : {
    groups: Group[]
    meetings: GroupMeeting[]
    selectedGroup?: Group
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const router = useRouter()

    const { register, handleSubmit, setValue, setError, getValues, watch, trigger, reset, formState: { isSubmitting, errors, isValid } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema),
        mode: "all",
    })
    
    type FormFields = z.infer<typeof CreateMeetingSchema>

    const [date, setDate] = useState<DateValue | null>()
    const [startHour, setStartHour] = useState<TimeInputValue | null>()
    const [endHour, setEndHour] = useState<TimeInputValue | null>()

    const cityId = watch("cityId")
    const [regionId, setRegionId] = useState<string | undefined>()
    const [countryId, setCountryId] = useState<string | undefined>()
    
    const [groupName, setGroupName] = useState<string | undefined>()

    const initializedGroupData = useCallback((group?: Group) => {
        const city = cities.find(c => c.id === group?.cityId)
        const region = regions.find(r => r.id === city?.regionId)
        const country = countries.find(c => c.id === region?.countryId)

        reset({
            ...getValues(),
            groupId: group?.id,
            street: group?.street ?? undefined,
            cityId: group?.cityId ?? undefined,
            price: group?.price ?? undefined
        })

        setGroupName(group?.name)
        setRegionId(region?.id)
        setCountryId(country?.id)
    },[cities, countries, getValues, regions, reset])

    const {isOpen, onOpen, onClose} = useDisclosure()

    const disabledDates = useMemo(() => {
        return meetings
            .map(meeting => {
                const date = new Date(meeting.startTime)
                return parseDate(date.toISOString().split("T")[0]) // YYYY-MM-DD
            })
    }, [meetings]) //, selectedGroup])

    const isDateUnavailable = (date: DateValue) => {
        return disabledDates.some(disabled =>
            date.compare(disabled) === 0
        )
    }

    const submit: SubmitHandler<FormFields> = async (data) => {
        const result = await CreateMeeting(data)

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

    useEffect(() => {
        if (isOpen) initializedGroupData(selectedGroup)
    }, [isOpen, selectedGroup, initializedGroupData])

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
                onPress={onOpen}
            >
                Utwórz nowe spotkanie
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    <ModalHeader>Nowe spotkanie dla grupy: {groupName}</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <Select {...register("groupId")}
                                label="Grupa"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Załoga Czarnej Perły"
                                isRequired
                                selectedKeys={[watch("groupId")]}
                                onSelectionChange={(keys) => {
                                    const group = groups.find(group => group.id === Array.from(keys)[0])
                                    initializedGroupData(group)
                                }}
                                items={groups}
                            >
                                {(group) => <SelectItem key={group.id}>{group.name}</SelectItem>}
                            </Select>
                            <DatePicker
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                value={date}
                                minValue={today(getLocalTimeZone()).add({days: 1})}
                                isDateUnavailable={isDateUnavailable}
                                onChange={(date) => {
                                    setDate(date)
                                    if (date && startHour) setValue("startTime", combineDateAndTime(date, startHour), {shouldValidate: true})
                                    if (date && endHour) setValue("endTime", combineDateAndTime(date, endHour), {shouldValidate: true})
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
                                            setValue("startTime", combineDateAndTime(date, time), {shouldValidate: true})
                                            trigger("endTime")
                                        }
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date}
                                    //isInvalid={!!errors.startTime}
                                    //errorMessage={errors.startTime?.message}
                                />
                                <TimeInput
                                    label="Godzina Zakończenia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={endHour}
                                    onChange={(time) => {
                                        setEndHour(time)
                                        if (date && time) setValue("endTime" , combineDateAndTime(date, time), {shouldValidate: true})
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date || !startHour}
                                    isInvalid={!!errors.endTime}
                                    errorMessage={errors.endTime?.message}
                                />
                            </div>
                            <Input {...register("street", {
                                    setValueAs: liveNameify
                                })}
                                label="Adres (ulica, numer)"
                                labelPlacement="outside"
                                placeholder="Tortuga 13/7"
                                variant="bordered"
                                type="text"
                                value={watch("street")}
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.street}
                                errorMessage={errors.street?.message}
                            />
                            <Select
                                label="Kraj"
                                labelPlacement="outside"
                                placeholder="Karaiby"
                                variant="bordered"
                                selectedKeys={countryId ? [countryId] : []}
                                onChange={(event)=>{
                                    setCountryId(event.target.value)
                                    setRegionId(undefined)
                                    setValue("cityId", "", {shouldValidate: true})
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
                                selectedKeys={regionId ? [regionId] : []}
                                onChange={(event)=>{
                                    setRegionId(event.target.value)
                                    setValue("cityId", "", {shouldValidate: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting || !countryId}
                                items={regions.filter(region => region.countryId === countryId)}
                            >
                                {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                            </Select>
                            <Select {...register("cityId")}
                                label="Miasto"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Isla de Muerta"
                                selectedKeys={[cityId]}
                                onChange={(event) => {
                                    setValue("cityId", event.target.value, {shouldValidate: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting || !countryId || !regionId}
                                items={cities.filter(city => city.regionId === regionId)}
                            >
                                {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
                            </Select>
                            <Input {...register("price", { setValueAs: numberify })}
                                label="Cena"
                                labelPlacement="outside"
                                variant="bordered"
                                min={0}
                                placeholder="150"
                                value={watch("price")?.toString() || undefined}
                                endContent={<div className="text-foreground-500 text-sm">PLN</div>}
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
                                isDisabled={isSubmitting || !isValid}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Dodaj nowe spotkanie"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    )
}

export default CreateMeetingModal;