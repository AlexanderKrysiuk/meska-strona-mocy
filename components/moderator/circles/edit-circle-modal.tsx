"use client"

import { EditCircle } from "@/actions/circle"
import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { EditCircleSchema } from "@/schema/circle"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { liveSlugify } from "@/utils/slug"
import { Button, Divider, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Radio, RadioGroup, Select, SelectItem, TimeInput, TimeInputValue, Tooltip, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, Country, Currency, Region, WeekDay } from "@prisma/client"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../../loader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil } from "@fortawesome/free-solid-svg-icons"
import { formatTimeZone, getIanaTimeZones } from "@/utils/timeZone"
import { StringToTimeValue, TimeValuetoString } from "@/utils/date"

const EditCircleModal = ({
    circle
} : {
    circle: Pick<Circle, "id" | "name" | "slug" | "maxMembers" | "minMembers" | "public" | "cityId" | "street" | "timeZone" | "plannedWeekday" | "startHour" | "endHour" | "frequencyWeeks" | "newUserPrice" | "price" | "currency">
}) => {
    const moderator = clientAuth()

    const {isOpen, onOpen, onClose} = useDisclosure()

    const queries = useQueries({
        queries: [
            {
                queryKey: [GeneralQueries.Countries],
                queryFn: () => GetCountries()
            },
            {
                queryKey: [GeneralQueries.Regions],
                queryFn: () => GetRegions(),
            },
            {
                queryKey: [GeneralQueries.Cities],
                queryFn: () => GetCities()
            },
        ]
    })

    const [countries, regions, cities] = queries

    type FormFields = z.infer<typeof EditCircleSchema>

    const { reset, watch, setValue, setError, trigger, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid }} = useForm<FormFields>({
        resolver: zodResolver(EditCircleSchema),
        mode: "all",
        defaultValues: {
            circleId: circle.id,
            name: circle.name,
            slug: circle.slug,
            members: {
                max: circle.maxMembers,
                min: circle.minMembers
            },
            isPublic: circle.public,
            isOnline: circle.cityId === null,
            cityId: circle.cityId,
            street: circle.street,
            timeZone: circle.timeZone,
            plannedWeekday: circle.plannedWeekday,
            hours: {
                start: circle.startHour,
                end: circle.endHour
            },
            frequencyWeeks: circle.frequencyWeeks,
            newUserPrice: circle.newUserPrice,
            price: circle.price,
            currency: circle.currency
        }
    })
    
    const city = cities.data?.find(c => c.id === watch("cityId"))
    const [region, setRegion] = useState<Region | undefined>(regions.data?.find(r => r.id === city?.regionId));
    const [country, setCountry] = useState<Country | undefined>(countries.data?.find(c => c.id === region?.countryId));

    const [startTime, setStartTime] = useState<TimeInputValue | null>(StringToTimeValue(circle.startHour))
    const [endTime, setEndTime] = useState<TimeInputValue | null>(StringToTimeValue(circle.endHour))
    const ianaTimeZones = getIanaTimeZones();

    // useEffect(() => {      
    //     const circle = circles.data?.find(c => c.id === watch("circleId"))

    //     reset({
    //         circleId: circle?.id,
    //         name: circle?.name,
    //         slug: circle?.slug,
    //         members: {
    //             max: circle?.maxMembers,
    //             min: circle?.minMembers
    //         },
    //         street: circle?.street,
    //         cityId: circle?.city?.id,
    //         isPublic: circle?.public,
    //         price: circle?.price,
    //         newUserPrice: circle?.newUserPrice,
    //         currency: circle?.currency
    //     });

    //     const city = cities.data?.find(c => c.id === circle?.city?.id)
    //     const region = regions.data?.find(r => r.id === city?.regionId)
    //     const country = countries.data?.find(c => c.id === region?.countryId)
    //     setRegion(region)
    //     setCountry(country)

    // }, [watch(), reset, cities.data, regions.data, countries.data]);

    // useEffect(()=>{
    //     if (!cities.data || !regions.data || !countries.data) return
    //     const city = cities.data.find(c => c.id === circle?.cityId)
    //     const region = regions.data.find(r => r.id === city?.regionId)
    //     const country = countries.data.find(c => c.id === region?.countryId)
    //     setRegion(region)
    //     setCountry(country)
    // }, [cities.data, regions.data, countries.data, circle])

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async (data) => {

        const result = await EditCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.Circles, moderator?.id]})
            reset(data)
        } else {
            if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof FormFields, { type: "manual", message })
                })
            }
        }      
    }

    if (queries.some(q => q.isLoading)) return <Loader/>

    return <main>
        <Tooltip
            content="Edytuj"
            color="primary"
        >
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faPencil}/>}
                onPress={onOpen}
                variant="light"
                radius="full"
                isIconOnly
            />
        </Tooltip>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
            size="xl"
        >
            <ModalContent>
                <ModalHeader>Edycja kręgu</ModalHeader>
                {/* <pre>
                    {JSON.stringify(watch(),null,2)}
                </pre> */}
                <Form onSubmit={handleSubmit(submit)}>
                    <ModalBody className="w-full">
                        Ustawienia ogólne:
                        <Divider/>
                        <Input
                            label="Nazwa kręgu"
                            labelPlacement="outside"
                            type="text"
                            placeholder="Załoga Czarnej Perły"
                            variant="bordered"
                            value={watch("name")}
                            onValueChange={(value) => {
                                setValue("name", value, {shouldValidate: true, shouldDirty: true})
                                setValue("slug", liveSlugify(value), {shouldValidate: true, shouldDirty: true})
                            }}
                            isClearable
                            isRequired
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        />
                        <Input
                            label="Unikalny odnośnik"
                            labelPlacement="outside"
                            placeholder="zaloga-czarnej-perly"
                            description="Ten odnośnik będzie częścią adresu URL Twojej grupy."
                            variant="bordered"
                            value={watch("slug")}
                            onValueChange={(value) => {setValue("slug", liveSlugify(value), {shouldValidate: true, shouldDirty: true})}}
                            isClearable
                            isRequired
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.slug}
                            errorMessage={errors.slug?.message}
                        />
                        <NumberInput
                            label="Maksymalna liczba uczestników"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Podaj liczbę"
                            minValue={1}
                            formatOptions={{ maximumFractionDigits: 0 }}
                            value={watch("members.max")}
                            onValueChange={(value) => {
                                setValue("members.max", value, {shouldValidate: true, shouldDirty: true})
                                trigger("members.min")
                            }}
                            isClearable
                            isRequired
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.members?.max || !!errors.members}
                            errorMessage={errors.members?.max?.message || !!errors.members?.message}
                        />
                        <NumberInput
                            label="Minimalna liczba uczestników"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Podaj liczbę"
                            minValue={1}
                            formatOptions={{ maximumFractionDigits: 0 }}
                            value={watch("members.min")}
                            onValueChange={(value) => {
                                setValue("members.min", value, {shouldValidate: true, shouldDirty: true})
                                trigger("members.max")
                            }}
                            isClearable
                            isRequired
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.members?.min || !!errors.members}
                            errorMessage={errors.members?.min?.message || !!errors.members?.message}
                        />
                        <RadioGroup
                            label="Widoczność kręgu"
                            orientation="horizontal"
                            //value={isOnline ?? undefined} // undefined = brak zaznaczenia
                            //value={watch("isPublic")}
                            //onValueChange={(val) => setValue("isPublic", val === "public", { shouldValidate: true, shouldDirty: true,})}
                            value={watch("isPublic") === undefined ? undefined : watch("isPublic") ? "public" : "private"}
                            onValueChange={(val) => setValue("isPublic", val === "public" ? true : false, {shouldValidate: true, shouldDirty: true})}
                            isRequired
                            isDisabled={isSubmitting}
                        >
                            <Radio 
                                value={"public"}
                                description="Każdy może się zapisać"
                            >
                                Publiczny
                            </Radio>
                            <Radio 
                                value={"private"}
                                color="danger" 
                                description="Zapisać się mogą tylko osoby z linkiem"
                            >
                                Prywatny
                            </Radio>
                        </RadioGroup>
                        Dane Adresowe:
                        <Divider/>
                        <RadioGroup
                            label="Rodzaj kręgu"
                            orientation="horizontal"
                            value={watch("isOnline") ? "online" : "offline"}
                            onValueChange={(value) => {
                                const isOnline = value === "online";

                                setValue("isOnline", isOnline, { shouldValidate: true });

                                if (isOnline) {
                                    // online — czyścimy dane offline
                                    setCountry(undefined)
                                    setRegion(undefined)
                                    setValue("cityId", null, { shouldValidate: true });
                                    setValue("street", null, { shouldValidate: true });
                                    setValue("timeZone", Intl.DateTimeFormat().resolvedOptions().timeZone, { shouldValidate: true, shouldDirty: true } )
                                } else {
                                    // offline — czyścimy dane online
                                    setValue("timeZone", null, { shouldValidate: true, shouldDirty: true });
                                }
                            }}
                            isRequired
                            isDisabled={isSubmitting}
                        >
                            <Radio value="online">Online</Radio>
                            <Radio value="offline">Stacjonarnie</Radio>
                        </RadioGroup>
                        {watch("isOnline") ? <Select
                            label="Strefa czasowa"
                            labelPlacement="outside"
                            placeholder="Tortuga GMT+21:37"
                            variant="bordered"
                            selectedKeys={watch("timeZone") ? [watch("timeZone") as string] : []}
                            hideEmptyContent
                            disallowEmptySelection
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys)[0]
                                setValue("timeZone", key.toString(), {shouldValidate: true, shouldDirty: true})
                            }}
                            isRequired
                            isDisabled={isSubmitting}
                            items={ianaTimeZones}
                        >
                            {(timeZone) => <SelectItem key={timeZone.name}>{formatTimeZone(timeZone.name)}</SelectItem>}
                        </Select> : <>
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
                                    setValue("cityId", null, {shouldValidate: true})
                                }}  
                                isRequired
                                isDisabled={isSubmitting || watch("isOnline")}
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
                                    setValue("cityId", null, {shouldValidate: true})
                                }}  
                                isRequired
                                isDisabled={isSubmitting || !country || watch("isOnline")}
                                items={regions.data?.filter(region => region.countryId === country?.id)}
                            >
                                {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                            </Select>
                            <Select
                                label="Miasto"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Isla de Muerta"
                                selectedKeys={watch("cityId") ? [watch("cityId") as string] : []}
                                hideEmptyContent        
                                onSelectionChange={(keys) => {
                                    const cityId = Array.from(keys)[0]
                                    setValue("cityId", cityId ? cityId.toString() : null, {shouldValidate: true, shouldDirty: true})
                                }}
                                isRequired
                                isDisabled={!region || !country || isSubmitting || watch("isOnline")}
                                isInvalid={!!errors.cityId}
                                errorMessage={errors.cityId?.message}
                                items={cities.data?.filter(city => city.regionId === region?.id)}
                            >
                                {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
                            </Select>
                            <Input
                                label="Adres (ulica, numer)"
                                labelPlacement="outside"
                                placeholder="Tortuga 21/37"
                                variant="bordered"
                                type="text"
                                value={watch("street") ?? ""}
                                onValueChange={(value) => {setValue("street", value || null, {shouldValidate: true, shouldDirty: true})}}
                                isClearable
                                isDisabled={isSubmitting || watch("isOnline")}
                                isInvalid={!!errors.street}
                                errorMessage={errors.street?.message}
                            />
                        </>}
                        Dane dotyczące spotkań:
                        <Divider/>
                        <Select
                            label="Planowany dzień tygodnia"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Wybierz planowany dzień spotkań"
                            selectedKeys={watch("plannedWeekday") ? [watch("plannedWeekday") as string] : []}
                            hideEmptyContent        
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys)[0];
                                setValue("plannedWeekday", key === "null" ? null : (key as WeekDay), { shouldValidate: true, shouldDirty: true });
                            }}
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.plannedWeekday}
                            errorMessage={errors.plannedWeekday?.message}
                            items={[
                                { key: "null", label: "Brak planowanego dnia" }, // opcja dla null
                                ...Object.values(WeekDay).map(day => ({
                                    key: day,
                                    label: {
                                        Monday: "Poniedziałek",
                                        Tuesday: "Wtorek",
                                        Wednesday: "Środa",
                                        Thursday: "Czwartek",
                                        Friday: "Piątek",
                                        Saturday: "Sobota",
                                        Sunday: "Niedziela"
                                    }[day]
                                }))
                            ]}
                        >
                            {(day) => <SelectItem key={day.key}>{day.label}</SelectItem>}
                        </Select>
                        <div className="flex gap-2">
                            <TimeInput
                                label="Czas rozpoczęcia"
                                hourCycle={24}
                                labelPlacement="outside"
                                variant="bordered"
                                value={startTime}
                                onChange={(time) => {
                                    if (time) {
                                        //setValue("hours.start", `${time.hour.toString().padStart(2,'0')}:${time.minute.toString().padStart(2,'0')}`, {shouldValidate: true, shouldDirty: true})
                                        setValue("hours.start", TimeValuetoString(time), {shouldValidate: true, shouldDirty: true})
                                        setStartTime(time)
                                        if (endTime) trigger("hours.end")
                                    }        
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.hours?.start}
                                errorMessage={errors.hours?.start?.message}
                            />
                            <TimeInput
                                label="Czas zakończenia"
                                hourCycle={24}
                                labelPlacement="outside"
                                variant="bordered"
                                value={endTime}
                                onChange={(time) => {
                                    if (time) {
                                        //setValue("hours.end", `${time.hour.toString().padStart(2,'0')}:${time.minute.toString().padStart(2,'0')}`, {shouldValidate: true, shouldDirty: true})
                                        setValue("hours.end", TimeValuetoString(time), {shouldValidate: true, shouldDirty: true})
                                        setEndTime(time)
                                        if (startTime) trigger("hours.start")
                                    }        
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.hours?.end}
                                errorMessage={errors.hours?.end?.message}
                            />
                        </div>
                        <NumberInput
                            label="Cykliczność (tygodnie)"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Podaj cykliczność kręgu"
                            minValue={1}
                            formatOptions={{ maximumFractionDigits: 0 }}
                            value={watch("frequencyWeeks") || undefined}
                            onValueChange={(value) => setValue("frequencyWeeks", value ?? null, { shouldValidate: true, shouldDirty: true })}
                            isClearable
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.frequencyWeeks}
                            errorMessage={errors.frequencyWeeks?.message}
                        />
                        Cena spotkania:
                        <Divider/>
                        <NumberInput 
                            label="Pierwsze"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="150"
                            minValue={0}
                            value={watch("newUserPrice") || undefined}
                            onValueChange={(value) => {setValue("newUserPrice", value, {shouldValidate: true, shouldDirty: true})}}
                            isRequired
                            isClearable
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.newUserPrice}
                            errorMessage={errors.newUserPrice?.message}    
                        />
                        <NumberInput 
                            label="Kolejne"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="150"
                            minValue={0}
                            value={watch("price") || undefined}
                            onValueChange={(value) => {setValue("price", value, {shouldValidate: true, shouldDirty: true})}}
                            isRequired
                            isClearable
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.price}
                            errorMessage={errors.price?.message}    
                        />
                        <Select
                            label="Waluta"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="PLN"
                            selectedKeys={watch("currency") ? [watch("currency")] : []}
                            hideEmptyContent
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys)[0];
                                if (key) setValue("currency", key as Currency, { shouldValidate: true, shouldDirty: true });
                            }}
                            isRequired
                            isDisabled={isSubmitting}
                            isInvalid={!!errors.currency}
                            errorMessage={errors.currency?.message}
                            items={Object.values(Currency).map(c => ({ key: c, label: c }))}
                        >
                            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="submit"
                            color="primary"
                            isDisabled={isSubmitting || !isValid || !isDirty}
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? "Przetwarzanie..." : "Zmień dane kręgu"}
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    </main>

    // return <Form onSubmit={handleSubmit(submit)}>
    //     <Select
    //         label="Krąg"
    //         labelPlacement="outside"
    //         items={circles.data}
    //         variant="bordered"
    //         placeholder="Wybierz krąg"
    //         onSelectionChange={(keys) => {
    //             const id = Array.from(keys)[0]
    //             setValue("circleId", id as string)
    //         }}
    //         isDisabled={!circles}
    //         hideEmptyContent
    //     >
    //         {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
    //     </Select>
    //     <Input
    //         label="Nazwa kręgu"
    //         labelPlacement="outside"
    //         type="text"
    //         placeholder="Załoga Czarnej Perły"
    //         variant="bordered"
    //         value={watch("name")}
    //         onValueChange={(value) => {
    //             setValue("name", value, {shouldDirty: true, shouldValidate: true})
    //             setValue("slug", liveSlugify(value), {shouldDirty: true, shouldValidate: true})
    //         }}
    //         isClearable
    //         isRequired
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.name}
    //         errorMessage={errors.name?.message}
    //     />
    //     <Input
    //         label="Unikalny odnośnik"
    //         labelPlacement="outside"
    //         placeholder="zaloga-czarnej-perly"
    //         description="Ten odnośnik będzie częścią adresu URL Twojej grupy."
    //         variant="bordered"
    //         value={watch("slug")}
    //         onValueChange={(value) => {setValue("slug", liveSlugify(value), {shouldDirty: true ,shouldValidate: true})}}
    //         isClearable
    //         isRequired
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.slug}
    //         errorMessage={errors.slug?.message}
    //     />
    //     <NumberInput
    //         label="Maksymalna liczba uczestników"
    //         labelPlacement="outside"
    //         variant="bordered"
    //         placeholder="11"
    //         minValue={1}
    //         maxValue={15}
    //         formatOptions={{ maximumFractionDigits: 0 }}
    //         value={watch("members.max")}
    //         onValueChange={(value) => {
    //             setValue("members.max", value, {shouldDirty:true, shouldValidate: true})
    //             trigger("members.min")
    //         }}
    //         isClearable
    //         isRequired
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.members?.max || !!errors.members}
    //         errorMessage={errors.members?.max?.message || !!errors.members?.message}
    //     />
    //     <NumberInput
    //         label="Minimalna liczba uczestników"
    //         labelPlacement="outside"
    //         variant="bordered"
    //         placeholder="1"
    //         minValue={1}
    //         maxValue={15}
    //         formatOptions={{ maximumFractionDigits: 0 }}
    //         value={watch("members.min")}
    //         onValueChange={(value) => {
    //             setValue("members.min", value, {shouldDirty:true, shouldValidate: true})
    //             trigger("members.max")
    //         }}
    //         isClearable
    //         isRequired
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.members?.min || !!errors.members}
    //         errorMessage={errors.members?.min?.message || !!errors.members?.message}
    //     />
    //     <Input
    //         label="Adres (ulica, numer)"
    //         labelPlacement="outside"
    //         placeholder="Tortuga 13/7"
    //         variant="bordered"
    //         type="text"
    //         value={watch("street") || ""}
    //         onValueChange={(value) => {setValue("street", value || null, {shouldDirty:true, shouldValidate: true})}}
    //         isClearable
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.street}
    //         errorMessage={errors.street?.message}
    //     />
    //     <Select
    //         label="Kraj"
    //         labelPlacement="outside"
    //         placeholder="Karaiby"
    //         variant="bordered"
    //         selectedKeys={country ? [country.id] : []}
    //         hideEmptyContent
    //         disallowEmptySelection
    //         onSelectionChange={(keys) => {
    //             const ID = Array.from(keys)[0].toString()
    //             const country = countries.data?.find(c => c.id === ID)
    //             setCountry(country)
    //             setRegion(undefined)
    //             setValue("cityId", null, {shouldValidate: true, shouldDirty: true,})
    //         }}  
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         items={countries.data}
    //     >
    //         {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
    //     </Select>
    //     <Select
    //         label="Województwo"
    //         labelPlacement="outside"
    //         placeholder="Archipelag Czarnej Perły"
    //         variant="bordered"
    //         selectedKeys={region ? [region.id] : []}
    //         hideEmptyContent
    //         disallowEmptySelection
    //         onSelectionChange={(keys) => {
    //             const ID = Array.from(keys)[0].toString()
    //             const region = regions.data?.find(r => r.id === ID)
    //             setRegion(region)
    //             setValue("cityId", null, {shouldValidate: true, shouldDirty: true,})
    //         }}  
    //         isDisabled={!watch("circleId") || isSubmitting || !country}
    //         items={regions.data?.filter(region => region.countryId === country?.id)}
    //     >
    //         {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
    //     </Select>
    //     <Select
    //         label="Miasto"
    //         labelPlacement="outside"
    //         variant="bordered"
    //         placeholder="Isla de Muerta"
    //         selectedKeys={[watch("cityId")!]}
    //         hideEmptyContent        
    //         onSelectionChange={(keys) => {
    //             const cityId = Array.from(keys)[0]
    //             setValue("cityId", cityId ? cityId.toString() : null, {shouldValidate: true, shouldDirty: true})
    //         }}
    //         isDisabled={!watch("circleId") || !region || !country || isSubmitting}
    //         isInvalid={!!errors.cityId}
    //         errorMessage={errors.cityId?.message}
    //         items={cities.data?.filter(city => city.regionId === region?.id)}
    //     >
    //         {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
    //     </Select>
    //     <NumberInput 
    //         label="Cena"
    //         labelPlacement="outside"
    //         variant="bordered"
    //         placeholder="150"
    //         minValue={0}
    //         value={watch("price")!}
    //         onValueChange={(value) => {setValue("price", value ?? null, {shouldDirty:true, shouldValidate: true})}}
    //         isClearable
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.price}
    //         errorMessage={errors.price?.message}    
    //     />
    //     <NumberInput
    //         label="Cena dla nowego kręgowca"
    //         labelPlacement="outside"
    //         variant="bordered"
    //         placeholder="150"
    //         minValue={0}
    //         value={watch("newUserPrice") ?? undefined}
    //         onValueChange={(value) => setValue("newUserPrice", value ?? null, {shouldDirty: true, shouldValidate: true})}
    //         isClearable
    //         isDisabled={!watch("circleId") || isSubmitting}
    //         isInvalid={!!errors.newUserPrice}
    //         errorMessage={errors.newUserPrice?.message}
    //     />
    //     <Select
    //         label="Waluta"
    //         labelPlacement="outside"
    //         variant="bordered"
    //         placeholder="PLN"
    //         selectedKeys={[watch("currency")!]}
    //         hideEmptyContent     
    //         onSelectionChange={(keys) => {setValue("currency", Array.from(keys)[0] as Currency ?? null, {shouldValidate: true, shouldDirty: true})}}
    //         isDisabled={!watch("circleId")}
    //         isInvalid={!!errors.currency}
    //         errorMessage={errors.currency?.message}
    //     >
    //         {Object.values(Currency).map((c) => (
    //             <SelectItem key={c}>{c}</SelectItem>
    //         ))}
    //     </Select>
    //     <RadioGroup
    //         label="Widoczność kręgu"
    //         orientation="horizontal"
    //         value={watch("isPublic") ? "public" : "private"}
    //         onValueChange={(val) => setValue("isPublic", val === "public", { shouldValidate: true, shouldDirty: true,})}
    //         isDisabled={!watch("circleId") || isSubmitting}
    //     >
    //         <Radio 
    //             value={"public"}
    //             description="Każdy może się zapisać"
    //         >
    //             Publiczny
    //         </Radio>
    //         <Radio 
    //             value={"private"}
    //             color="danger" 
    //             description="Zapisać się mogą tylko osoby z linkiem"
    //         >
    //             Prywatny
    //         </Radio>
    //     </RadioGroup>
    //     <Button
    //         type="submit"
    //         color="primary"
    //         isDisabled={!watch("circleId") || isSubmitting || !isDirty || !isValid}
    //         isLoading={isSubmitting}
    //         className="mt-4"
    //     >
    //         {isSubmitting ? "Przetwarzanie..." : "Zmień dane kręgu"}
    //     </Button>
    // </Form>
}

export default EditCircleModal
