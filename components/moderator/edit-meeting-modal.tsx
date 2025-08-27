"use client"

import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { EditMeeting, GetModeratorMeetingsByModeratorID } from "@/actions/meeting"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { EditMeetingSchema } from "@/schema/meeting"
import { FormError } from "@/utils/errors"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, CircleMeeting, CircleMeetingStatus, Country, Region } from "@prisma/client"
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../loader"
import { getLocalTimeZone, today } from "@internationalized/date"
import { combineDateAndTime, convertDateToNative, convertDateToTimeInputValue, convertDateValueToDate, formatShortDate, isSameDay } from "@/utils/date"

export const EditMeetingModal = ({
    meeting,
    circle,
    country
} : {
    meeting: CircleMeeting
    circle: Circle
    country: Country
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    return <main>
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
                    Edytujesz spotkanie z dnia: {formatShortDate(meeting.startTime, meeting.endTime, country.locale, true)}<br/>
                    Dla kręgu: {circle.name}
                </ModalHeader>
                <EditMeetingForm meeting={meeting}/>
            </ModalContent>
        </Modal>
    </main>
}

const EditMeetingForm = ({
    meeting
} : {
    meeting: CircleMeeting
}) => {
    const moderator = clientAuth()

    const queries = useQueries({
        queries: [
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

    const [scheduledMeetings, completedMeetings, ArchivedMeetings, countries, regions, cities] = queries
    
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

    type FormFields = z.infer<ReturnType<typeof EditMeetingSchema>>

    const { clearErrors, handleSubmit, watch, trigger, setValue, setError, formState: { errors, isValid, isSubmitting, isDirty } } = useForm<FormFields>({
        resolver: zodResolver(EditMeetingSchema(unavailableDates, meeting.startTime)),
        mode: "all",
        defaultValues: {
            meetingId: meeting.id,
            circleId: meeting.circleId,
            date: meeting.startTime,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            street: meeting.street,
            cityId: meeting.cityId,
            price: meeting.price,
        }
    })

    const [countryID] = useState<string | undefined>()
    const [regionID] = useState<string | undefined>()

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
        mutationFn: (data: FormFields) => EditMeeting(data),
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
            <DatePicker
                label="Data spotkania"
                labelPlacement="outside"
                variant="bordered"
                defaultValue={convertDateToNative(meeting.startTime)}
                isDateUnavailable={isDateUnavailable}
                minValue={today(getLocalTimeZone()).add({days: 1})}
                onChange={(date) => {
                    if (!date) return;
                    setValue("date", convertDateValueToDate(date), { shouldValidate: true, shouldDirty: true });
                    const startTime = watch("startTime");
                    const endTime = watch("endTime");
                    
                    if (startTime) setValue("startTime", combineDateAndTime(date, startTime), {shouldDirty: true});
                    if (endTime) setValue("endTime", combineDateAndTime(date, endTime), {shouldDirty: true});
                
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
                    defaultValue={convertDateToTimeInputValue(meeting.startTime)}
                    onChange={(time) => {
                        const date = watch("date")
                        if (!time || !date) return;
                        setValue("startTime", combineDateAndTime(date, time), {shouldValidate:true, shouldDirty:true})
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
                    defaultValue={convertDateToTimeInputValue(meeting.endTime)}
                    onChange={(time) => {
                        const date = watch("date")
                        if (!time || !date) return;
                        setValue("endTime", combineDateAndTime(date, time), {shouldValidate:true, shouldDirty:true})
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
                onValueChange={(value)=>{setValue("street", value, {shouldValidate: true, shouldDirty:true})}}
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
                onSelectionChange={(keys) => {setValue("cityId", Array.from(keys)[0] as string, {shouldValidate:true, shouldDirty:true})}}
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
                onValueChange={(value) => {setValue("price", value, {shouldValidate: true, shouldDirty:true})}}
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



// "use client"

// import { EditMeeting } from "@/actions/meeting"
// import { EditMeetingSchema } from "@/schema/meeting"
// import { combineDateAndTime } from "@/utils/date"
// import { faPen } from "@fortawesome/free-solid-svg-icons"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, Tooltip, addToast, useDisclosure } from "@heroui/react"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { CalendarDate, Time, getLocalTimeZone, parseAbsoluteToLocal, today } from "@internationalized/date"
// import { City, Country, Circle, CircleMeeting, Region } from "@prisma/client"
// import { useRouter } from "next/navigation"
// import { useMemo, useState } from "react"
// import { SubmitHandler, useForm } from "react-hook-form"
// import { z } from "zod"

// const EditMeetingModal = ({
//     meeting,
//     meetings,
//     circle,
//     countries,
//     regions,
//     cities
// } : {
//     meeting: CircleMeeting
//     meetings: CircleMeeting[]
//     circle: Circle
//     countries: Country[]
//     regions: Region[]
//     cities: City[]
// }) => {
//     const router = useRouter()

//     type FormFields = z.infer<typeof EditMeetingSchema>

//     //const [date, setDate] = useState<DateValue | null>(parseDate(meeting.startTime.toISOString().split("T")[0]))
//     //const [startHour, setStartHour] = useState<TimeInputValue | null>()
//     //const [endHour, setEndHour] = useState<TimeInputValue | null>()   

//     // start
//     const startZdt = parseAbsoluteToLocal(meeting.startTime.toISOString()); // ZonedDateTime w lokalnej strefie
//     // end
//     const endZdt   = parseAbsoluteToLocal(meeting.endTime.toISOString());
    
//     // DatePicker: oczekuje DateValue — użyjemy CalendarDate (data BEZ czasu)
//     const [date, setDate] = useState<DateValue | null>(
//       new CalendarDate(startZdt.year, startZdt.month, startZdt.day)
//     );
    
//     // TimeInputValue: użyjemy Time (hh:mm)
//     const [startHour, setStartHour] = useState<TimeInputValue | null>(
//       new Time(startZdt.hour, startZdt.minute)
//     );
    
//     const [endHour, setEndHour] = useState<TimeInputValue | null>(
//       new Time(endZdt.hour, endZdt.minute)
//     );

//     // jutro
//     const tomorrow = today(getLocalTimeZone()).add({ days: 1 });

//     // data startowa z meeting.startTime
//     const startDateFromMeeting = new CalendarDate(startZdt.year, startZdt.month, startZdt.day);

//     // wybieramy wcześniejszą z nich
//     const minDate = startDateFromMeeting.compare(tomorrow) < 0 ? startDateFromMeeting : tomorrow;
    
//     const { handleSubmit, setError, setValue, watch, trigger, formState: { isSubmitting, errors, isValid, isDirty } } = useForm<FormFields>({
//         resolver: zodResolver(EditMeetingSchema),
//         mode: "all",
//         defaultValues: {
//             meetingId: meeting.id,
//             startTime: meeting.startTime,
//             endTime: meeting.endTime,
//             street: meeting.street,
//             cityId: meeting.cityId,
//             price: meeting.price
//         }
//     })

//     const city = cities.find(c => c.id === meeting.cityId)
//     const region = regions.find(r => r.id === city?.regionId)
//     const country = countries.find(c => c.id === region?.countryId)

//     const cityId = watch("cityId")
//     const [regionId, setRegionId] = useState<string | undefined>(region?.id)
//     const [countryId, setCountryId] = useState<string | undefined>(country?.id)
    
//     const disabledDates = useMemo(() => {
//         return meetings
//             .filter(m => m.id !== meeting.id) // <- pomijamy edytowane spotkanie
//             .map(m => {
//                 const z = parseAbsoluteToLocal(m.startTime.toISOString()); // ZonedDateTime w lokalnej strefie
//                 return new CalendarDate(z.year, z.month, z.day); // tylko data (bez godziny)
//                 //parseDate(new Date(m.startTime).toISOString().split("T")[0])
//             })
//       }, [meetings, meeting.id])

//     const isDateUnavailable = (date: DateValue) => {
//         return disabledDates.some(disabled =>
//             date.compare(disabled) === 0
//         )
//     }

//     const submit: SubmitHandler<FormFields> = async (data) => {
//         const result = await EditMeeting(data)

//         addToast({
//             title: result.message,
//             color: result.success ? "success" : "danger",
//             variant: "bordered"
//         })

//         if (result.errors) {
//             Object.entries(result.errors).forEach(([field, messages]) => {
//                 setError(field as keyof FormFields, { message: messages.join(", ") })
//             })
//         } else {
//             router.refresh()
//             onClose()
//         }
//     }

//     const {isOpen, onOpen, onClose} = useDisclosure()

//     return (
//         <main>
//             <Tooltip
//                 color="primary"
//                 placement="top"
//                 content="Edytuj Spotkanie"
//             >
//                 <Button
//                     color="primary"
//                     isIconOnly
//                     onPress={onOpen}
//                     variant="light"
//                     radius="full"
//                 >
//                     <FontAwesomeIcon icon={faPen} size="lg"/>
//                 </Button>
//             </Tooltip>
//             <Modal
//                 isOpen={isOpen}
//                 onClose={onClose}
//                 placement="center"
//                 scrollBehavior="outside"
//             >
//                 <ModalContent>
//                     <ModalHeader>Spotkanie Grupy: {circle.name}</ModalHeader>
//                     {/* <Divider/>
//                     <pre>

//                         {JSON.stringify(watch(),null,2)}<br/>
//                         {JSON.stringify(date,null,2)}
//                         {JSON.stringify(startHour,null,2)}
//                         {JSON.stringify(endHour,null,2)}
//                         {JSON.stringify(regionId,null,2)}<br/>
//                         {JSON.stringify(countryId,null,2)}<br/>
//                         Valid: {JSON.stringify(isValid,null,2)}
//                     </pre>
//                     <Divider/> */}

//                     <Form onSubmit={handleSubmit(submit)}>
//                         <ModalBody className="w-full">
//                             <DatePicker
//                                 label="Data spotkania"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 value={date}
//                                 isDateUnavailable={isDateUnavailable}
//                                 minValue={minDate}
//                                 onChange={(date) => {
//                                     setDate(date)
//                                     if (date && startHour) setValue("startTime", combineDateAndTime(date, startHour), {shouldValidate: true, shouldDirty: true})
//                                     if (date && endHour) setValue("endTime", combineDateAndTime(date, endHour), {shouldValidate: true, shouldDirty: true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.startTime}
//                                 errorMessage={errors.startTime?.message}
//                             />
//                             <div className="flex space-x-4">
//                                 <TimeInput
//                                     label="Godzina Rozpoczęcia"
//                                     labelPlacement="outside"
//                                     variant="bordered"
//                                     hourCycle={24}
//                                     value={startHour}
//                                     onChange={(time) => {
//                                         setStartHour(time)
//                                         if (date && time) {
//                                             setValue("startTime", combineDateAndTime(date, time), {shouldValidate: true, shouldDirty: true}) 
//                                             trigger("endTime")
//                                         }
//                                     }}
//                                     isRequired
//                                     isDisabled={isSubmitting || !date}
//                                 />
//                                 <TimeInput
//                                     label="Godzina Zakończenia"
//                                     labelPlacement="outside"
//                                     variant="bordered"
//                                     hourCycle={24}
//                                     value={endHour}
//                                     onChange={(time) => {
//                                         setEndHour(time)
//                                         if (date && time) setValue("endTime", combineDateAndTime(date, time), {shouldValidate: true, shouldDirty: true})
//                                     }}
//                                     isRequired
//                                     isDisabled={isSubmitting || !date || !startHour}
//                                     isInvalid={!!errors.endTime}
//                                     errorMessage={errors.endTime?.message}
//                                 />
//                             </div>
//                             <Select
//                                 label="Kraj"
//                                 labelPlacement="outside"
//                                 placeholder="Karaiby"
//                                 variant="bordered"
//                                 selectedKeys={[countryId!]}
//                                 onChange={(event) => {
//                                     setCountryId(event.target.value)
//                                     setRegionId(undefined)
//                                     setValue("cityId", undefined!, {shouldValidate:true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 items={countries}
//                             >
//                                 {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
//                             </Select>
//                             <Select
//                                 label="Województwo"
//                                 labelPlacement="outside"
//                                 placeholder="Archipelag Czarnej Perły"
//                                 variant="bordered"
//                                 selectedKeys={[regionId!]}
//                                 onChange={(event) => {
//                                     setRegionId(event.target.value)
//                                     setValue("cityId", undefined!, {shouldValidate: true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting || !countryId}
//                                 items={regions.filter(region => region.countryId === countryId)}
//                             >
//                                 {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
//                             </Select>
//                             <Select
//                                 label="Miasto"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 placeholder="Isla de Muerta"
//                                 selectedKeys={[cityId]}
//                                 onChange={(event) => {
//                                     setValue("cityId", event.target.value, {shouldValidate: true, shouldDirty: true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting || !countryId || !regionId}
//                                 items={cities.filter(city => city.regionId === regionId)}
//                             >
//                                 {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
//                             </Select>
//                             <Input
//                                 label="Adres (ulica, numer)"
//                                 labelPlacement="outside"
//                                 placeholder="Tortuga 13/7"
//                                 variant="bordered"
//                                 type="text"
//                                 value={watch("street")}
//                                 onValueChange={(value) => setValue("street", value, {shouldDirty: true, shouldValidate: true})}
//                                 isClearable
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.street}
//                                 errorMessage={errors.street?.message}
//                             />
//                             <NumberInput
//                                 label="Cena"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 placeholder="150,00 zł"
//                                 minValue={0}
//                                 formatOptions={{
//                                     style: "currency",
//                                     currency: "PLN"
//                                 }}
//                                 value={watch("price")}
//                                 onValueChange={(value) => setValue("price", value, {shouldDirty:true, shouldValidate:true})}
//                                 isClearable
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.price}
//                                 errorMessage={errors.price?.message}                                        
//                             />
//                         </ModalBody>
//                         <ModalFooter>
//                             <Button
//                                 type="submit"
//                                 color="primary"
//                                 isLoading={isSubmitting}
//                                 isDisabled={isSubmitting || !isValid || !isDirty} 
//                             >
//                                 {isSubmitting ? "Przetwarzanie..." : "Zmień dane spotkania"}
//                             </Button>
//                         </ModalFooter>
//                     </Form>
//                 </ModalContent>
//             </Modal>
//         </main>
//     )
// }

// export default EditMeetingModal;