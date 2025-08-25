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
import { Circle, CircleMeetingStatus } from "@prisma/client"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../loader"
import { FormError } from "@/utils/errors"
import { combineDateAndTimeInputValue } from "@/utils/date"

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
      
    // funkcja pomocnicza do porównywania dni
    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
      
    const isDateUnavailable = useCallback(
        (date: DateValue) => {
            if (!date) return false;
            const d = new Date(date.year, date.month - 1, date.day);
            return unavailableDates.some(disabled => isSameDay(d, disabled));
        },[unavailableDates]
    );
    type FormFields = z.infer<ReturnType<typeof CreateMeetingSchema>>
    
    const { handleSubmit, watch, trigger, setValue, setError, formState: { errors, isValid, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema(unavailableDates)),
        mode: "all",
        defaultValues: {
            circleId: circle?.id,
            street: circle?.street ?? undefined,
            cityId: circle?.cityId ?? undefined,
            price: circle?.price ?? undefined
        }
    })
        
    const [countryID, setCountryID] = useState<string | undefined>()
    const [regionID, setRegionID] = useState<string | undefined>()

    const cityID = watch("cityId")

    useEffect(() => {
        const city = cities.data?.find(c => c.id === cityID)
        const region = regions.data?.find(r => r.id === city?.regionId)
        const country = countries.data?.find(c => c.id === region?.countryId)

        setRegionID(region?.id)
        setCountryID(country?.id)
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
                    if (!date) return;
                    const selectedDate = new Date(date.year, date.month - 1, date.day);
                    setValue("date", selectedDate, { shouldValidate: true });
                    const startTime = watch("startTime");
                    const endTime = watch("endTime");    
                    
                    if (startTime) {
                        const startDate = new Date(selectedDate);
                        startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
                        setValue("startTime", startDate);
                    }
                
                    if (endTime) {
                        const endDate = new Date(selectedDate);
                        endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
                        setValue("endTime", endDate);
                    }
                
                    if (startTime) trigger("startTime")
                    if (endTime) trigger("endTime")
                    if (isDateUnavailable(date)) {
                        setError("date", { type: "manual", message: "W tym dniu masz już inne spotkanie" });
                        return
                    }
                
                // if (date < today(getLocalTimeZone()).add({days: 1})) {
                //     setError("date", { type: "manual", message: "Spotkanie możesz dodać najwcześniej jutro" });
                //     return
                // }                            
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

                        setValue("startTime", combineDateAndTimeInputValue(date, time), {shouldValidate:true})
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

                        setValue("endTime", combineDateAndTimeInputValue(date, time), {shouldValidate:true})
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