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
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getLocalTimeZone, today } from "@internationalized/date"
import { Circle, CircleMeetingStatus, Country, Region } from "@prisma/client"
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../loader"
import { combineDateAndTime, isSameDay } from "@/utils/date"
import { GetCurrencies } from "@/actions/currency"

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
            isDisabled={circles && circles?.length < 1}
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
            },
            {
                queryKey: [GeneralQueries.Currencies],
                queryFn: () => GetCurrencies()
            }
        ]
    })

    const [circles, scheduledMeetings, completedMeetings, ArchivedMeetings, countries, regions, cities, currencies] = queries
    
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
    
    const { reset, handleSubmit, watch, trigger, setValue, setError, formState: { errors, isValid, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema(unavailableDates)),
        mode: "all",
        defaultValues: {
            circleId: circle?.id,
            street: circle?.street ?? undefined,
            cityId: circle?.cityId ?? undefined,
            price: circle?.price ?? undefined,
            currencyId: circle?.currencyId ?? undefined
        }
    })
    
    const [region, setRegion] = useState<Region | undefined>();
    const [country, setCountry] = useState<Country | undefined>();
    const [startHour, setStartHour] = useState<TimeInputValue | null>()
    const [endHour, setEndHour] = useState<TimeInputValue | null>()
    
    useEffect(() => {
      if (!cities.data || !regions.data || !countries.data) return;
    
      const defaultCity = cities.data.find(c => c.id === circle?.cityId);
      const defaultRegion = regions.data.find(r => r.id === defaultCity?.regionId);
      const defaultCountry = countries.data.find(c => c.id === defaultRegion?.countryId);
    
      setRegion(defaultRegion);
      setCountry(defaultCountry);
    }, [cities.data, regions.data, countries.data, circle]);

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await CreateMeeting(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.ScheduledMeetings, moderator?.id],})
        } else {
            if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof FormFields, { type: "manual", message });
                });
            }
        }
    }

    if (queries.some(q => q.isLoading || !q.data)) return <Loader/>

    return <Form onSubmit={handleSubmit(submit)}>
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
                    reset(
                        {
                            circleId: circle?.id ?? undefined,
                            date: watch("date"),
                            TimeRangeSchema: {
                                startTime: watch("TimeRangeSchema.startTime"),
                                endTime: watch("TimeRangeSchema.endTime"),
                            },
                            street: circle?.street ?? undefined,
                            cityId: circle?.cityId ?? undefined,
                            price: circle?.price ?? undefined,
                        },
                        {keepErrors: true}
                    )

                    const city = cities.data?.find(c => c.id === watch("cityId"))
                    const region = regions.data?.find(r => r.id === city?.regionId)
                    const country = countries.data?.find(c => c.id === region?.countryId)

                    setRegion(region)
                    setCountry(country)
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
                description="Zawsze podawaj czas lokalny, w którym chcesz umówić spotkanie. Po wybraniu kraju wartości się automatycznie zaktualizują."
                isDateUnavailable={isDateUnavailable}
                minValue={country?.timeZone ? today(country.timeZone).add({ days: 1 }) : today(getLocalTimeZone()).add({days: 1})}
                onChange={(date) => {
                    if (!date) return;
                    setValue("date", combineDateAndTime(date, undefined, country?.timeZone), { shouldValidate: true });
                    const startTime = watch("TimeRangeSchema.startTime");
                    const endTime = watch("TimeRangeSchema.endTime");    
                    
                    if (startTime) setValue("TimeRangeSchema.startTime", combineDateAndTime(date, startTime, country?.timeZone));
                    if (endTime) setValue("TimeRangeSchema.endTime", combineDateAndTime(date, endTime, country?.timeZone));
                
                    if (startTime) trigger("TimeRangeSchema.startTime")
                    if (endTime) trigger("TimeRangeSchema.endTime")          
                }}
                isRequired
                isInvalid={!!errors.date}
                errorMessage={errors.date?.message}
                isDisabled={isSubmitting}
            />
            <div className="flex space-x-4 w-full my-4">
                <TimeInput
                    label="Godzina Rozpoczęcia"
                    labelPlacement="outside"
                    variant="bordered"
                    hourCycle={24}
                    value={startHour}
                    onChange={(time) => {
                        setStartHour(time)
                        const date = watch("date")
                        if (!time || !date) return;
                        setValue("TimeRangeSchema.startTime", combineDateAndTime(date, time, country?.timeZone), {shouldValidate:true})
                        if (watch("TimeRangeSchema.endTime")) trigger("TimeRangeSchema.endTime")
                    }}
                    isRequired
                    isDisabled={isSubmitting || !watch("date")}
                    isInvalid={!!errors.TimeRangeSchema?.startTime}
                    errorMessage={errors.TimeRangeSchema?.startTime?.message}
                />
                <TimeInput
                    label="Godzina zakończenia"
                    labelPlacement="outside"
                    variant="bordered"
                    hourCycle={24}
                    onChange={(time) => {
                        setEndHour(time)
                        const date = watch("date")
                        if (!time || !date) return;
                        setValue("TimeRangeSchema.endTime", combineDateAndTime(date, time, country?.timeZone), {shouldValidate:true})
                        if (watch("TimeRangeSchema.startTime")) trigger("TimeRangeSchema.startTime")
                    }}
                    isRequired
                    isDisabled={isSubmitting || !watch("date") || !watch("TimeRangeSchema.startTime")}
                    isInvalid={!!errors.TimeRangeSchema?.endTime}
                    errorMessage={errors.TimeRangeSchema?.endTime?.message}
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
                    reset(
                        {
                            circleId: watch("circleId"),
                            date: combineDateAndTime(watch("date"), undefined, country?.timeZone),
                            TimeRangeSchema: {
                                startTime: combineDateAndTime(watch("date"), startHour, country?.timeZone),
                                endTime: combineDateAndTime(watch("date"), endHour, country?.timeZone),
                            },
                            street: watch("street"),
                            cityId: undefined,
                            price: watch("price")
                        },
                        {keepErrors: true}
                    );
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
                    reset(
                        {
                            circleId: watch("circleId"),
                            date: watch("date"),
                            TimeRangeSchema: {
                                startTime: watch("TimeRangeSchema.startTime"),
                                endTime: watch("TimeRangeSchema.endTime")
                            },
                            street: watch("street"),
                            cityId: undefined,
                            price: watch("price")
                        },
                        {keepErrors: true}
                    );
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
                value={watch("price")}
                onValueChange={(value) => {setValue("price", value, {shouldValidate: true})}}
                endContent={
                    <select
                        value={watch("currencyId") ?? ""}
                        onChange={(event) => {
                            const val = event.target.value;
                            setValue("currencyId", val, { shouldValidate: true });
                        }}
                    >
                        <option value="">Brak</option> {/* opcja brak */}
                        {currencies.data?.map((c)=>(
                            <option key={c.id} value={c.id}>{c.code}</option>
                        ))}
                    </select>
                }
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