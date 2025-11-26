"use client"

import { GetModeratorCircles } from "@/actions/circle"
import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { CreateMeeting, GetModeratorMeetingsDates } from "@/actions/meeting"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { CreateMeetingSchema } from "@/schema/meeting"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { faCalendarPlus, faCity, faClock, faGlobe, faHouse, faRoad } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DateInputValue, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getLocalTimeZone, today } from "@internationalized/date"
import { Circle, City, Country, Currency, Prisma, Region } from "@prisma/client"
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { date, z } from "zod"
import Loader from "../../loader"
import { combineDateAndTime, convertDateToNative, getGMTOffset, isSameDay } from "@/utils/date"
import {I18nProvider} from "@react-aria/i18n";

export const CreateMeetingModal = ({
    //circle
} : {
    //circle?: Circle
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
                {/* {JSON.stringify(circle)} */}
                <ModalHeader>Utwórz nowe spotkanie</ModalHeader>
                <CreateMeetingform 
                    //circle={circle}
                />
            </ModalContent>
        </Modal>
    </main>
}

const CreateMeetingform = ({
    //circle,    
} : {
    //circle?: Circle
}) => {
    const moderator = clientAuth()

    const [timeZone, setTimeZone] = useState<string>(getLocalTimeZone());
    
    const queries = useQueries({
        queries: [
            { 
                queryKey: [ModeratorQueries.Circles, moderator?.id], 
                queryFn: () => GetModeratorCircles(moderator!.id),
                enabled: !!moderator
            },
            {
                queryKey: [ModeratorQueries.AllMeetingsDates, moderator?.id],
                queryFn: () => GetModeratorMeetingsDates(moderator!.id),
                enabled: !!moderator?.id
            },              
            // {
                //     queryKey: [GeneralQueries.Countries],
            //     queryFn: () => GetCountries(),
            // },
            // {
            //     queryKey: [GeneralQueries.Regions],
            //     queryFn: () => GetRegions()
            // },
            // { 
            //     queryKey: [GeneralQueries.Cities],
            //     queryFn: () => GetCities()
            // }
        ]
    })

    const [
        circles, allMeetingsDates, 
        //    countries, regions, cities
    ] = queries
    
    const unavailableDates = useMemo(() => allMeetingsDates.data ?? [], [allMeetingsDates]);
    
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
    })
    
    type SelectedCircle = {
        street?: string | null;
        city?: string | null;
        country?: string | null;
        timeZone?: string | null;
    };
              
    //const [region, setRegion] = useState<Region | undefined>();
    //const [country, setCountry] = useState<Country | undefined>();
    const [startHour, setStartHour] = useState<TimeInputValue | null>()
    const [endHour, setEndHour] = useState<TimeInputValue | null>()
    const [date, setDate] = useState<DateInputValue | null>()
    const [selectedCircle, setSelectedCircle] = useState<SelectedCircle>()
    //useEffect(() => {
        //  if (!cities.data || !regions.data || !countries.data) return;
        
        //  const defaultCity = cities.data.find(c => c.id === circle?.cityId);
        //  const defaultRegion = regions.data.find(r => r.id === defaultCity?.regionId);
        //  const defaultCountry = countries.data.find(c => c.id === defaultRegion?.countryId);
        
        //  setRegion(defaultRegion);
        //  setCountry(defaultCountry);
        //}, [cities.data, regions.data, countries.data, circle]);
        
    useEffect(() => {
        const circle = circles.data?.find(c => c.id === watch("circleId"))
        setTimeZone(circle?.city?.region.country.timeZone ?? getLocalTimeZone())
        setSelectedCircle({
            street: circle?.street,
            city: circle?.city?.name,
            country: circle?.city?.region.country.name,
            timeZone: circle?.city?.region.country.timeZone
        })
    }, [watch("circleId"), reset, circles.data]);

    useEffect(() => {
        if (!date) return
        setValue("date", combineDateAndTime(date, undefined, timeZone), { shouldValidate: true });

        if (startHour) setValue("TimeRangeSchema.startTime", combineDateAndTime(date, startHour, timeZone), { shouldValidate: true });
        if (endHour) setValue("TimeRangeSchema.endTime", combineDateAndTime(date, endHour, timeZone), { shouldValidate: true });

        // opcjonalnie trigger dla walidacji zależnych pól
        if (startHour) trigger("TimeRangeSchema.startTime");
        if (endHour) trigger("TimeRangeSchema.endTime");
    }, [date, startHour, endHour, setValue, trigger, timeZone])

    const queryClient = useQueryClient()
        
    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await CreateMeeting(data)
            
        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })
            
        if (result.success) {
            const year = new Date(data.date).getFullYear()
                
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.AllMeetingsDates, moderator?.id]})
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.MeetingsYears, moderator?.id]})
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.Meetings, moderator?.id, year]})
        } else {
            if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof FormFields, { type: "manual", message });
                });
            }
        }
    }
        
    if (queries.some(q => q.isLoading)) return <Loader/>
        
    return <Form onSubmit={handleSubmit(submit)}>
        <ModalBody className="w-full">
            {selectedCircle?.city ? <div>
                <FontAwesomeIcon icon={faRoad} className="mr-2"/>
                Adres: {selectedCircle.street || "Miejsce nieustalone"}
                <br/>
                <FontAwesomeIcon icon={faCity} className="mr-2"/>
                Miasto: {selectedCircle.city}
                <br/>
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Kraj: {selectedCircle.country}
            </div> : <div>
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Krąg online
                <br/>
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                Strefa czasowa: {getGMTOffset(timeZone)}
            </div>}
            {/* 
            <pre>
                WATCH: {JSON.stringify(watch(),null,2)}<br/>
                TimeZone: {JSON.stringify(timeZone,null,2)}
            </pre>
            <pre>
                COUNTRY: {JSON.stringify(country,null,2)}<br/>
                REGION: {JSON.stringify(region,null,2)}<br/>
                CITYID: {JSON.stringify(watch("cityId"),null,2)}
            </pre> 
            */}
            <Select
                hideEmptyContent
                disallowEmptySelection
                label="Krąg"
                labelPlacement="outside"
                variant="bordered"
                placeholder="Załoga Czarnej Perły"
                //selectedKeys={[watch("circleId")]}
                onSelectionChange={(keys) => {
                    const id = Array.from(keys)[0];
                    setValue("circleId", id as string)
                    //const circle = circles.data?.find(c => c.id === id)
                    // reset(
                    //     {
                    //         circleId: circle?.id ?? undefined,
                    //         date: watch("date"),
                    //         TimeRangeSchema: {
                    //             startTime: watch("TimeRangeSchema.startTime"),
                    //             endTime: watch("TimeRangeSchema.endTime"),
                    //         },
                    //         //street: circle?.street ?? undefined,
                    //         //cityId: circle?.cityId ?? undefined,
                    //         //price: circle?.price ?? undefined,
                    //         //currency: circle?.currency ?? undefined,
                    //     },
                    //     {keepErrors: true}
                    // )

                    //const city = cities.data?.find(c => c.id === watch("cityId"))
                    //const region = regions.data?.find(r => r.id === city?.regionId)
                    //const country = countries.data?.find(c => c.id === region?.countryId)

                    //setRegion(region)
                    //setCountry(country)
                }}
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.circleId}
                errorMessage={errors.circleId?.message}
                items={circles.data}
            >
                {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
            </Select>
            <I18nProvider locale="pl-PL">
                <DatePicker
                    label="Data spotkania"
                    labelPlacement="outside"
                    variant="bordered"
                    description="Zawsze podawaj czas lokalny, w którym chcesz umówić spotkanie. Po wybraniu kraju wartości się automatycznie zaktualizują."
                    value={date}
                    isDateUnavailable={isDateUnavailable}
                    minValue={timeZone ? today(timeZone).add({ days: 1 }) : today(getLocalTimeZone()).add({days: 1})}
                    onChange={setDate}
                    // onChange={(date) => {
                    //     if (!date) return;
                    //     setValue("date", combineDateAndTime(date, undefined, timeZone), { shouldValidate: true });
                    //     const startTime = watch("TimeRangeSchema.startTime");
                    //     const endTime = watch("TimeRangeSchema.endTime");    
                    
                    //     if (startTime) setValue("TimeRangeSchema.startTime", combineDateAndTime(date, startTime, timeZone));
                    //     if (endTime) setValue("TimeRangeSchema.endTime", combineDateAndTime(date, endTime, timeZone));
                
                    //     if (startTime) trigger("TimeRangeSchema.startTime")
                    //     if (endTime) trigger("TimeRangeSchema.endTime")          
                    // }}
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
                        onChange={setStartHour}
                        // onChange={(time) => {
                        //     setStartHour(time)
                        //     const date = watch("date")
                        //     if (!time || !date) return;
                        //     setValue("TimeRangeSchema.startTime", combineDateAndTime(date, time, timeZone), {shouldValidate:true})
                        //     if (watch("TimeRangeSchema.endTime")) trigger("TimeRangeSchema.endTime")
                        // }}
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
                        value={endHour}
                        onChange={setEndHour}
                        // onChange={(time) => {
                        //     setEndHour(time)
                        //     const date = watch("date")
                        //     if (!time || !date) return;
                        //     setValue("TimeRangeSchema.endTime", combineDateAndTime(date, time, timeZone), {shouldValidate:true})
                        //     if (watch("TimeRangeSchema.startTime")) trigger("TimeRangeSchema.startTime")
                        // }}
                        isRequired
                        isDisabled={isSubmitting || !watch("date") || !watch("TimeRangeSchema.startTime")}
                        isInvalid={!!errors.TimeRangeSchema?.endTime}
                        errorMessage={errors.TimeRangeSchema?.endTime?.message}
                    />
                </div>
            </I18nProvider>
            {/* <Input
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
            /> */}
            {/* <Select
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
            </Select> */}
            {/* <Select
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
            </Select> */}
            {/* <Select
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
            </Select> */}
            {/* <NumberInput
                label="Cena"
                labelPlacement="outside"
                variant="bordered"
                placeholder="150,00 zł"
                minValue={0}
                value={watch("price")}
                onValueChange={(value) => {setValue("price", value, {shouldValidate: true})}}
                endContent={
                    <select
                        value={watch("currency") ?? ""}
                        onChange={(event) => {
                            const val = event.target.value as Currency;
                            setValue("currency", val , { shouldValidate: true, shouldDirty: true });
                        }}
                    >
                        <option value="">Brak</option> 
                        {Object.values(Currency).map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                }
                isClearable
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.price}
                errorMessage={errors.price?.message}
            /> */}
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