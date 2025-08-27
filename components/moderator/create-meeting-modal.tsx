"use client"

import { GetModeratorCircles } from "@/actions/circle"
import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { CreateMeeting, GetModeratorMeetingsByModeratorID } from "@/actions/meeting"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { CreateMeetingSchema } from "@/schema/meeting"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getLocalTimeZone, today } from "@internationalized/date"
import { Circle, CircleMeetingStatus, Country, Region } from "@prisma/client"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../loader"
import { FormError } from "@/utils/errors"
import { combineDateAndTime, convertDateValueToDate, isSameDay } from "@/utils/date"

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
                <CreateMeetingform circle={circle}/>
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
    
    const unavailableDates = useMemo(() => [scheduledMeetings, completedMeetings, ArchivedMeetings]
            .flatMap(q => q.data ?? [])
            .map(meeting => {
                const d = new Date(meeting.startTime);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // tylko data, bez godziny
            }),
        [scheduledMeetings, completedMeetings, ArchivedMeetings]
    );
      
    const isDateUnavailable = useCallback(
        (date: DateValue) => {
            if (!date) return false;
            const d = new Date(date.year, date.month - 1, date.day);
            return unavailableDates.some(disabled => isSameDay(d, disabled));
        },[unavailableDates]
    );
    type FormFields = z.infer<ReturnType<typeof CreateMeetingSchema>>
    
    const { reset, clearErrors, handleSubmit, watch, trigger, setValue, setError, formState: { errors, isValid, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema(unavailableDates)),
        mode: "all",
        defaultValues: {
            circleId: circle?.id,
            street: circle?.street ?? undefined,
            cityId: circle?.cityId ?? undefined,
            price: circle?.price ?? undefined
        }
    })
        
    const [country, setCountry] = useState<Country | undefined>()
    const [region, setRegion] = useState<Region | undefined>()

    const cityID = watch("cityId")

    useEffect(() => {
        const city = cities.data?.find(c => c.id === cityID)
        const region = regions.data?.find(r => r.id === city?.regionId)
        const country = countries.data?.find(c => c.id === region?.countryId)

        setRegion(region)
        setCountry(country)
    }, [cityID, cities.data, regions.data, countries.data])
    
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
        onError: (error) => {
            addToast({
                title: error.message,
                color: "warning"
            })
            if (error instanceof FormError) {
                // Błędy formularza - możemy ustawić w state jeśli chcemy wyświetlać inline
                Object.entries(error.fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof FormFields, { type: "manual", message });
                });
            }
        }
    })

    if (queries.some(q => q.isLoading || !q.data)) return <Loader/>

    return <Form onSubmit={handleSubmit((data) => mutation.mutateAsync(data))}>
        <ModalBody className="w-full">
            {/* <pre>
                WATCH: {JSON.stringify(watch(),null,2)}<br/>
                COUNTRY: {JSON.stringify(country,null,2)}<br/>
                REGION: {JSON.stringify(region,null,2)}<br/>
                CITYID: {JSON.stringify(watch("cityId"),null,2)}
            </pre> */}
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

                    reset({
                        circleId: circle?.id ?? undefined,
                        date: watch("date"),
                        startTime: watch("startTime"),
                        endTime: watch("endTime"),
                        street: circle?.street ?? undefined,
                        cityId: circle?.cityId ?? undefined,
                        price: circle?.price ?? undefined,
                    })
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
                    if (!date) return;
                    setValue("date", convertDateValueToDate(date), { shouldValidate: true });
                    const startTime = watch("startTime");
                    const endTime = watch("endTime");    
                    
                    if (startTime) setValue("startTime", combineDateAndTime(date, startTime));
                    if (endTime) setValue("endTime", combineDateAndTime(date, endTime));
                
                    if (startTime) trigger("startTime")
                    if (endTime) trigger("endTime")          
                }}
                isRequired
                isInvalid={!!errors.date}
                errorMessage={errors.date?.message}
                isDisabled={isSubmitting}
            />
            <div className="flex space-x-4 w-full mb-4">
                <TimeInput
                    label="Godzina Rozpoczęcia"
                    labelPlacement="outside"
                    variant="bordered"
                    hourCycle={24}
                    onChange={(time) => {
                        const date = watch("date")
                        if (!time || !date) return;
                        setValue("startTime", combineDateAndTime(date, time), {shouldValidate:true})
                        if (watch("endTime")) trigger("endTime")
                    }}
                    isRequired
                    isDisabled={isSubmitting || !watch("date")}
                    isInvalid={!!errors.startTime}
                    errorMessage={errors.startTime?.message}
                />
                <TimeInput
                    label="Godzina zakończenia"
                    labelPlacement="outside"
                    variant="bordered"
                    hourCycle={24}
                    onChange={(time) => {
                        const date = watch("date")
                        if (!time || !date) return;
                        setValue("endTime", combineDateAndTime(date, time), {shouldValidate:true})
                        if (watch("startTime")) trigger("startTime")
                    }}
                    isRequired
                    isDisabled={isSubmitting || !watch("date") || !watch("startTime")}
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
                selectedKeys={country ? [country.id] : []}
                hideEmptyContent
                disallowEmptySelection
                onSelectionChange={(keys) => {
                    const ID = Array.from(keys)[0].toString()
                    const country = countries.data?.find(c => c.id === ID)
                    setCountry(country)
                    setRegion(undefined)
                    setValue("cityId", undefined!)
                    clearErrors("cityId")
                    // setCountryID(Array.from(keys)[0].toString())
                    // setRegionID(undefined)                 
                    // setValue("cityId", "", {shouldValidate: true})
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
                selectedKeys={region ? [region.id] : []}
                hideEmptyContent
                disallowEmptySelection
                onSelectionChange={(keys) => {
                    const ID = Array.from(keys)[0].toString()
                    const region = regions.data?.find(r => r.id === ID)
                    setRegion(region)
                    setValue("cityId", undefined!)
                    clearErrors("cityId")
                }}
                isRequired
                isDisabled={!regions || isSubmitting || !country}
                items={regions.data?.filter(region => region.countryId === country?.id)}
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
                isDisabled={!cities || isSubmitting || !region}
                isInvalid={!!errors.cityId}
                errorMessage={errors.cityId?.message}
                items={cities.data?.filter(city => city.regionId === region?.id)}
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
        </ModalBody>
        <ModalFooter className="w-full">
            <Button
                color="primary"
                fullWidth
                type="submit"
                isLoading={isSubmitting}
                isDisabled={isSubmitting || !isValid}
            >
                {isSubmitting ? "Przetwarzanie..." : "Dodaj spotkanie"}
            </Button>
        </ModalFooter>
    </Form>
}