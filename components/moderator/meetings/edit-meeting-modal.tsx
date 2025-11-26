"use client"

import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { EditMeeting, GetModeratorMeetingsDates } from "@/actions/meeting"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { EditMeetingSchema } from "@/schema/meeting"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DateInputValue, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, Meeting, Country, Region, Currency } from "@prisma/client"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../../loader"
import { getLocalTimeZone, today } from "@internationalized/date"
import { combineDateAndTime, convertDateToNative, convertDateToTimeInputValue, formatedDate, isSameDay } from "@/utils/date"
import { I18nProvider } from "@react-aria/i18n"
import { MeetingAction, moderatorMeetingActions } from "@/utils/meeting"

export const EditMeetingModal = ({
    meeting,
    circle,
    country
} : {
    meeting: Pick<Meeting, "id" | "startTime" | "endTime" | "status">
    circle: Pick<Circle, "name">
    country?: Pick<Country, "timeZone">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    if (moderatorMeetingActions[meeting.status].includes(MeetingAction.Edit)) return <main>
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
                <FontAwesomeIcon icon={faPen} size="xl"/>
            </Button>
        </Tooltip>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
            size="lg"
        >
            <ModalContent>
                <ModalHeader>
                    Edytujesz spotkanie z dnia: {formatedDate(meeting.startTime, meeting.endTime, country?.timeZone, "onlyDays")}<br/>
                    Dla kręgu: {circle.name}
                </ModalHeader>
                <EditMeetingForm 
                    meeting={meeting} 
                    country={country}
                    onClose={onClose}
                />
            </ModalContent>
        </Modal>
    </main>
}

const EditMeetingForm = ({
    meeting,
    country,
    onClose
} : {
    meeting: Pick<Meeting, "id" | "startTime" | "endTime">
    onClose: () => void;
    country?: Pick<Country, "timeZone">
}) => {
    const moderator = clientAuth()

    const queries = useQueries({
        queries: [
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

    const [allMeetingsDates, 
        //countries, regions, cities
    ] 
        = queries
    
    const unavailableDates = useMemo(() => allMeetingsDates.data ?? [], [allMeetingsDates]);

    const isDateUnavailable = useCallback(
        (date: DateValue) => {
            if (!date) return false;
            const d = new Date(date.year, date.month - 1, date.day);
            return unavailableDates.some(disabled => isSameDay(d, disabled));
        },[unavailableDates]
    );

    type FormFields = z.infer<ReturnType<typeof EditMeetingSchema>>
    const timeZone = country?.timeZone ?? getLocalTimeZone();

    const { handleSubmit, watch, trigger, reset, setValue, setError, formState: { errors, isValid, isSubmitting, isDirty } } = useForm<FormFields>({
        resolver: zodResolver(EditMeetingSchema(unavailableDates, meeting.startTime)),
        mode: "all",
        defaultValues: {
            meetingId: meeting.id,
            //circleId: meeting.circleId,
            date: meeting.startTime,
            TimeRangeSchema: {
                startTime: meeting.startTime,
                endTime: meeting.endTime
            },
            timeZone
            //street: meeting.street,
            //cityId: meeting.cityId,
            //priceCurrency: {
            //    price: meeting.price,
            //    currency: meeting.currency
            //}
        }
    })

    //const [region, setRegion] = useState<Region | undefined>();
    //const [country, setCountry] = useState<Country | undefined>();
    const [startHour, setStartHour] = useState<TimeInputValue | null>(convertDateToTimeInputValue(meeting.startTime));
    const [endHour, setEndHour] = useState<TimeInputValue | null>(convertDateToTimeInputValue(meeting.endTime))
    const [date, setDate] = useState<DateInputValue | null>(convertDateToNative(meeting.startTime))
    // useEffect(() => {
    //   if (!cities.data || !regions.data || !countries.data) return;
    
    //   const defaultCity = cities.data.find(c => c.id === meeting.cityId);
    //   const defaultRegion = regions.data.find(r => r.id === defaultCity?.regionId);
    //   const defaultCountry = countries.data.find(c => c.id === defaultRegion?.countryId);
    
    //   setRegion(defaultRegion);
    //   setCountry(defaultCountry);
    // }, [cities.data, regions.data, countries.data, meeting]);
    
    useEffect(() => {
        if (!date) return
        setValue("date", combineDateAndTime(date, undefined, timeZone), {shouldValidate: true})

        if (startHour) setValue("TimeRangeSchema.startTime", combineDateAndTime(date, startHour, timeZone), {shouldValidate: true})
        if (endHour) setValue("TimeRangeSchema.endTime", combineDateAndTime(date, endHour, timeZone), {shouldValidate: true})
    
        // opcjonalnie trigger dla walidacji zależnych pól
        if (startHour) trigger("TimeRangeSchema.startTime");
        if (endHour) trigger("TimeRangeSchema.endTime");
    }, [date, startHour, endHour, timeZone, setValue, trigger])

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await EditMeeting(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            const year = new Date(data.date).getFullYear()

            queryClient.invalidateQueries({queryKey: [ModeratorQueries.AllMeetingsDates, moderator?.id]})
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.MeetingsYears, moderator?.id]})
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.Meetings, moderator?.id, year]})
            onClose() 
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
            <I18nProvider locale="pl-PL">
                <DatePicker
                    label="Data spotkania"
                    labelPlacement="outside"
                    variant="bordered"
                    description="Zawsze podawaj czas lokalny, w którym chcesz umówić spotkanie. Po wybraniu kraju wartości się automatycznie zaktualizują."
                    defaultValue={convertDateToNative(meeting.startTime)}
                    isDateUnavailable={isDateUnavailable}
                    minValue={(() => {
                        const tomorrow = today(timeZone).add({ days: 1 });
                        const startMeeting = convertDateToNative(meeting.startTime);
                        return tomorrow > startMeeting ? startMeeting : tomorrow;

                        //const tomorrow = country?.timeZone
                        //    ? today(country.timeZone).add({ days: 1 })
                        //    : today(getLocalTimeZone()).add({ days: 1 })
                           //const startMeeting = convertDateToNative(meeting.startTime)
                           // return tomorrow > startMeeting ? startMeeting : tomorrow
                        })()
                    }   
                    onChange={setDate}            
                    // onChange={(date) => {
                    //     if (!date) return;
                    //     setValue("date", combineDateAndTime(date, undefined, country?.timeZone), { shouldValidate: true, shouldDirty: true });
                    //     const startTime = watch("TimeRangeSchema.startTime");
                    //     const endTime = watch("TimeRangeSchema.endTime");
                    
                    //     if (startTime) setValue("TimeRangeSchema.startTime", combineDateAndTime(date, startTime, country?.timeZone), {shouldDirty: true});
                    //     if (endTime) setValue("TimeRangeSchema.endTime", combineDateAndTime(date, endTime, country?.timeZone), {shouldDirty: true});
                    
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
                        defaultValue={convertDateToTimeInputValue(meeting.startTime)}
                        onChange={setStartHour}
                        // onChange={(time) => {
                        //     setStartHour(time)
                        //     const date = watch("date")
                        //     if (!time || !date) return;
                        //     setValue("TimeRangeSchema.startTime", combineDateAndTime(date, time, country?.timeZone), {shouldValidate:true, shouldDirty:true})
                        //     if (watch("TimeRangeSchema.endTime")) trigger("TimeRangeSchema.endTime")
                        //     }}
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
                        defaultValue={convertDateToTimeInputValue(meeting.endTime)}
                        onChange={setEndHour}
                        // onChange={(time) => {
                        //     setEndHour(time)
                        //     const date = watch("date")
                        //     if (!time || !date) return;
                        //     setValue("TimeRangeSchema.endTime", combineDateAndTime(date, time, country?.timeZone), {shouldValidate:true, shouldDirty:true})
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
                onValueChange={(value)=>{setValue("street", value, {shouldValidate: true, shouldDirty:true})}}
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
                            meetingId: watch("meetingId"),
                            circleId: watch("circleId"),
                            date: watch("date"),
                            TimeRangeSchema: {
                                startTime: combineDateAndTime(watch("date"), startHour, country?.timeZone),
                                endTime: combineDateAndTime(watch("date"), endHour, country?.timeZone),
                            },
                            street: watch("street"),
                            cityId: undefined,
                            priceCurrency: {
                                price: watch("priceCurrency.price"),
                                currency: watch("priceCurrency.currency")
                            }
                        },
                        {keepErrors: true}
                    );                
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
                            meetingId: watch("meetingId"),
                            circleId: watch("circleId"),
                            date: watch("date"),
                            TimeRangeSchema: {
                                startTime: watch("TimeRangeSchema.startTime"),
                                endTime: watch("TimeRangeSchema.endTime")
                            },
                            street: watch("street"),
                            cityId: undefined,
                            priceCurrency: {
                                price: watch("priceCurrency.price"),
                                currency: watch("priceCurrency.currency")
                            }                        
                        },
                        {keepErrors: true}
                    );
                }}
                isRequired
                isDisabled={!regions || isSubmitting}
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
                onSelectionChange={(keys) => {setValue("cityId", Array.from(keys)[0] as string, {shouldValidate:true, shouldDirty:true})}}
                isRequired
                isDisabled={!cities || isSubmitting}
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
                value={watch("priceCurrency.price")}
                onValueChange={(value) => {setValue("priceCurrency.price", value, {shouldValidate: true, shouldDirty:true})}}
                endContent={
                    <select
                        value={watch("priceCurrency.currency") ?? ""}
                        onChange={(event) => {
                            const val = event.target.value as Currency;
                            setValue("priceCurrency.currency", val , { shouldValidate: true, shouldDirty: true });
                        }}
                    >
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
                isInvalid={!!errors.priceCurrency?.price}
                errorMessage={errors.priceCurrency?.price?.message}
            /> */}
        </ModalBody>
        <ModalFooter className="w-full">
            <Button
                color="primary"
                fullWidth
                type="submit"
                isLoading={isSubmitting}
                isDisabled={isSubmitting || !isValid || !isDirty}
            >
                {isSubmitting ? "Przetwarzanie..." : "Zmień dane spotkania"}
            </Button>
        </ModalFooter>
        {/* <pre>
            {JSON.stringify(watch(),null,2)}
        </pre> */}
    </Form>

}