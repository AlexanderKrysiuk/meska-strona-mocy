"use client"

import { GetModeratorCircles } from "@/actions/circle"
import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { CreateMeeting, GetModeratorMeetingsByModeratorID } from "@/actions/meeting"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { CreateMeetingSchema } from "@/schema/meeting"
import { combineDateAndTime } from "@/utils/date"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getLocalTimeZone, parseDate, today } from "@internationalized/date"
import { Circle, CircleMeetingStatus } from "@prisma/client"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../loader"

export const CreateMeetingModal = ({
    circle
} : {
    circle?: Circle
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const moderator = clientAuth()

    const { data: circles } = useQuery({
        queryKey: [ModeratorQueries.Circles, moderator?.id],
        queryFn: () => GetModeratorCircles(moderator!.id),
        enabled: !!moderator
    })
    
    return <main>
        <Button
            color="primary"
            startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
            onPress={onOpen}
            isDisabled={!circles}
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
                <ModalHeader>Utwórz nowe spotkanie</ModalHeader>
                <ModalBody>
                    <CreateMeetingform circle={circle}/>
                </ModalBody>
                <ModalFooter/>
            </ModalContent>
        </Modal>
    </main>
}

const CreateMeetingform = ({
    circle
} : {
    circle?: Circle
}) => {
    const moderator = clientAuth()

    const queries = useQueries({
        queries: [
            { 
                queryKey: [ModeratorQueries.Circles, moderator?.id], 
                queryFn: () => GetModeratorCircles(moderator!.id),
                enabled: !!moderator
            },
            {
                queryKey: [ModeratorQueries.ScheduledMeetings, moderator?.id],
                queryFn: () => GetModeratorMeetingsByModeratorID(moderator!.id, CircleMeetingStatus.Scheduled),
                enabled: !!moderator?.id
            },
            {
                queryKey: [ModeratorQueries.CompletedMeetings, moderator?.id],
                queryFn: () => GetModeratorMeetingsByModeratorID(moderator!.id, CircleMeetingStatus.Completed),
                enabled: !!moderator?.id
            },
            {
                queryKey: [ModeratorQueries.ArchivedMeetings, moderator?.id],
                queryFn: () => GetModeratorMeetingsByModeratorID(moderator!.id, CircleMeetingStatus.Archived),
                enabled: !!moderator?.id
            },
            {
                queryKey: [GeneralQueries.Countries],
                queryFn: () => GetCountries(),
            },
            {
                queryKey: [GeneralQueries.Regions],
                queryFn: () => GetRegions()
            },
            { 
                queryKey: [GeneralQueries.Cities],
                queryFn: () => GetCities()
            }
        ]
    })

    
    const [circles, scheduledMeetings, completedMeetings, ArchivedMeetings, countries, regions, cities] = queries
    
    //if (!countries.data) return <Loader/>

    const unavailableDates = useMemo(() => 
        [scheduledMeetings, completedMeetings, ArchivedMeetings]
            .flatMap(q => q.data ?? [])
            .map(meeting => {
                const d = new Date(meeting.startTime);
                // pozostawiamy tylko datę bez godziny
                return parseDate(d.toISOString().split("T")[0]);
            }),
        [scheduledMeetings, completedMeetings, ArchivedMeetings]
    );
    
    const isDateUnavailable = useCallback(
        (date: DateValue) => unavailableDates.some(disabled => date.compare(disabled) === 0),
        [unavailableDates]
    );

    
    type FormFields = z.infer<typeof CreateMeetingSchema>
    
    const {handleSubmit, watch, setValue, trigger, formState: { errors, isValid, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema),
        mode: "all",
        defaultValues: {
            circleId: circle?.id,
            street: circle?.street ?? undefined,
            cityId: circle?.cityId ?? undefined,
            price: circle?.price ?? undefined
        }
    })
    
    const [date, setDate] = useState<DateValue | null>()

    const [startHour, setStartHour] = useState<TimeInputValue | null>()
    const [endHour, setEndHour] = useState<TimeInputValue | null>()
    
    const [countryID, setCountryID] = useState<string | undefined>()
    const [regionID, setRegionID] = useState<string | undefined>()

    useEffect(() => {
        const city = cities.data?.find(c => c.id === watch("cityId"))
        const region = regions.data?.find(r => r.id === city?.regionId)
        const country = countries.data?.find(c => c.id === region?.countryId)

        setRegionID(region?.id)
        setCountryID(country?.id)
    }, [watch, cities.data, regions.data, countries.data])
    
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (data: FormFields) => CreateMeeting(data),
        onSuccess: (result) => {
            addToast({
                title: result.message,
                color: "success"
            })
            queryClient.invalidateQueries({
                queryKey: [ModeratorQueries.ScheduledMeetings, moderator?.id],
            })
        },
        onError: (result) => {
            addToast({
                title: result.message,
                color: "warning"
            })
        }
    })

    if (queries.some(q => q.isLoading || !q.data)) return <Loader/>

    return <Form onSubmit={handleSubmit((data) => mutation.mutateAsync(data))}>
        <Select
            hideEmptyContent
            disallowEmptySelection
            label="Krąg"
            labelPlacement="outside"
            variant="bordered"
            placeholder="Załoga Czarnej Perły"
            selectedKeys={[watch("circleId")]}
            onSelectionChange={(keys) => {
                const id = Array.from(keys)[0];
                const circle = circles.data?.find(c => c.id === id)
                setValue("circleId", circle?.id ?? undefined!, {shouldValidate: true})
                setValue("street", circle?.street ?? undefined!, {shouldValidate: true})
                setValue("cityId", circle?.cityId ?? undefined!, {shouldValidate: true})
                setValue("price", circle?.price ?? undefined!, {shouldValidate: true})
            }}
            isRequired
            isDisabled={isSubmitting}
            isInvalid={!!errors.circleId}
            errorMessage={errors.circleId?.message}
            items={circles.data}
        >
            {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
        </Select>
        <DatePicker
            label="Data spotkania"
            labelPlacement="outside"
            variant="bordered"
            isDateUnavailable={isDateUnavailable}
            minValue={today(getLocalTimeZone()).add({days: 1})}
            onChange={(date) => {
                setDate(date)
                if (date && startHour) setValue("startTime", combineDateAndTime(date, startHour), {shouldValidate: true})
                if (date && endHour) setValue("endTime", combineDateAndTime(date, endHour), {shouldValidate:true})
            }}
            isRequired
            validate={(date) => {
                if (!date) return "Wybierz datę";
                if (date.compare(today(getLocalTimeZone()).add({days: 1})) < 0) return "Nie można wybrać przeszłej daty";
                if (isDateUnavailable(date)) return "Masz już spotkanie w tym terminie";
                return true;
            }}
            isDisabled={isSubmitting}
        />
        <div className="flex space-x-4 w-full">
            <TimeInput
                label="Godzina Rozpoczęcia"
                labelPlacement="outside"
                variant="bordered"
                hourCycle={24}
                onChange={(time) => {
                    setStartHour(time)
                    if (date && time) {
                        setValue("startTime", combineDateAndTime(date, time), {shouldValidate:true})
                        if (endHour) trigger("endTime")
                    }
                }}
                isRequired
                isDisabled={isSubmitting || !date}
                isInvalid={!!errors.startTime}
                errorMessage={errors.startTime?.message}
            />
            <TimeInput
                label="Godzina zakończenia"
                labelPlacement="outside"
                variant="bordered"
                hourCycle={24}
                onChange={(time) => {
                    setEndHour(time)
                    if (date && time) setValue("endTime", combineDateAndTime(date, time), {shouldValidate:true})
                }}
                isRequired
                isDisabled={isSubmitting || !date || !startHour}
                isInvalid={!!errors.endTime}
                errorMessage={errors.endTime?.message}
            />
        </div>
        <Input
            label="Adres (ulica, numer)"
            labelPlacement="outside"
            placeholder="Tortuga 13/7"
            variant="bordered"
            type="text"
            value={watch("street") ?? ""}
            onValueChange={(value)=>{setValue("street", value, {shouldValidate: true})}}
            isClearable
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
            selectedKeys={countryID ? [countryID] : []}
            hideEmptyContent
            disallowEmptySelection
            onSelectionChange={(keys) => {
                setCountryID(Array.from(keys)[0].toString())
                setRegionID(undefined)                 
                setValue("cityId", "", {shouldValidate: true})
            }}
            isRequired
            isDisabled={!countries || isSubmitting}
            items={countries.data}
        >
            {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
        </Select>
        <Select
            label="Województwo"
            labelPlacement="outside"
            placeholder="Archipelag Czarnej Perły"
            variant="bordered"
            selectedKeys={regionID ? [regionID] : []}
            hideEmptyContent
            disallowEmptySelection
            onSelectionChange={(keys) => {
                setRegionID(Array.from(keys)[0].toString())                 
                setValue("cityId", "", {shouldValidate: true})
            }}
            isRequired
            isDisabled={!regions || isSubmitting}
            items={regions.data?.filter(region => region.countryId === countryID)}
        >
            {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
        </Select>
        <Select
            label="Miasto"
            labelPlacement="outside"
            placeholder="Isla de Muerta"
            variant="bordered"
            selectedKeys={[watch("cityId")]}
            hideEmptyContent
            disallowEmptySelection
            onSelectionChange={(keys) => {setValue("cityId", Array.from(keys)[0] as string, {shouldValidate:true})}}
            isRequired
            isDisabled={!cities || isSubmitting}
            isInvalid={!!errors.cityId}
            errorMessage={errors.cityId?.message}
            items={cities.data?.filter(city => city.regionId === regionID)}
        >
            {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
        </Select>
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
            onValueChange={(value) => {setValue("price", value, {shouldValidate: true})}}
            isClearable
            isRequired
            isDisabled={isSubmitting}
            isInvalid={!!errors.price}
            errorMessage={errors.price?.message}
        />
        <Button
            color="primary"
            fullWidth
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isSubmitting || !isValid || (date ? isDateUnavailable(date) : false)}
        >
            Dodaj nowe spotkanie
        </Button>
    </Form>
}