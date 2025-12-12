"use client"

import { CreateCircle } from "@/actions/circle";
import { GetCities } from "@/actions/city";
import { GetCountries } from "@/actions/country";
import { GetRegions } from "@/actions/region";
import Loader from "@/components/loader";
import { clientAuth } from "@/hooks/auth";
import { CreateCircleSchema } from "@/schema/circle";
import { GeneralQueries, ModeratorQueries } from "@/utils/query";
import { liveSlugify } from "@/utils/slug";
import { formatTimeZone, getIanaTimeZones } from "@/utils/timeZone";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Radio, RadioGroup, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, Currency, Region, WeekDay } from "@prisma/client";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const CreateCircleModal = () => {
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

    type FormFields = z.infer<typeof CreateCircleSchema>

    const [region, setRegion] = useState<Region | null>();
    const [country, setCountry] = useState<Country | null>();

    const [startTime, setStartTime] = useState<TimeInputValue | null>()
    const [endTime, setEndTime] = useState<TimeInputValue | null>()
    const ianaTimeZones = getIanaTimeZones();
    
    const { handleSubmit, watch, trigger, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(CreateCircleSchema),
        mode: "all",
        defaultValues: {
            isOnline: true,
            isPublic: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cityId: null,
            street: null,
            members: {
                min: 1,
                max: 12
            },
            price: 150,
            newUserPrice: 150,
            currency: Currency.PLN
        }
    })
        
    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await CreateCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [ModeratorQueries.Circles, moderator?.id]})
            onClose()
        }
    }

    if (queries.some(q => q.isLoading)) return <Loader/>

    return ( 
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCirclePlus}/>}
                className="text-white"
                onPress={onOpen}
            >
                Utwórz nowy krąg
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
                size="xl"
            >
                <ModalContent>
                    <ModalHeader>Nowy krąg</ModalHeader>
                    <pre>

                    {/* {JSON.stringify(watch(),null,2)}<br/>
                    CountryID: {JSON.stringify(country,null,2)}<br/>
                    Region: {JSON.stringify(region,null,2)}<br/>
                    Valid: {JSON.stringify(isValid,null,2)} */}

                    </pre>
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
                                    setValue("name", value, {shouldValidate:true})
                                    setValue("slug", liveSlugify(value), {shouldValidate: true})
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
                                onValueChange={(value) => {setValue("slug", liveSlugify(value), {shouldValidate: true})}}
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
                                    setValue("members.max", value, {shouldValidate: true})
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
                                defaultValue={undefined}
                                //value={isOnline ?? undefined} // undefined = brak zaznaczenia
                                //value={watch("isPublic")}
                                //onValueChange={(val) => setValue("isPublic", val === "public", { shouldValidate: true, shouldDirty: true,})}
                                value={watch("isPublic") === undefined ? undefined : watch("isPublic") ? "public" : "private"}
                                onValueChange={(val) => setValue("isPublic", val === "public" ? true : false, {shouldValidate: true})}
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
                                        setCountry(null)
                                        setRegion(null)
                                        setValue("cityId", null, { shouldValidate: true });
                                        setValue("street", null, { shouldValidate: true });
                                        setValue("timeZone", Intl.DateTimeFormat().resolvedOptions().timeZone, { shouldValidate: true } )
                                    } else {
                                        // offline — czyścimy dane online
                                        setValue("timeZone", null, { shouldValidate: true });
                                    }
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                            >
                                <Radio value="online">Online</Radio>
                                <Radio value="offline">Stacjonarnie</Radio>
                            </RadioGroup>



                            {/* <RadioGroup
                                label="Rodzaj kręgu"
                                orientation="horizontal"
                                isRequired
                                defaultValue={undefined}
                                value={isOnline} // teraz typ pasuje: string | undefined
                                onValueChange={(value) => {
                                    const newValue = value as "online" | "offline";
                                    setIsOnline(newValue);
                                    //setIsOnline(value as "online" | "offline"); // rzutowanie na string literal
                                    //setValue("timeZone", null, {shouldValidate: true})
                                    if (value === "online") {  // jeśli teraz wybieramy online, czyścimy pola
                                        setCountry(null)
                                        setRegion(null)
                                        setValue("cityId", null, {shouldValidate: true})
                                        setValue("street", null, {shouldValidate: true})
                                    } else {
                                        setValue("timeZone", null, {shouldValidate: true})
                                    }
                                }}
                            >
                                <Radio value="online">Online</Radio>
                                <Radio value="offline">Stacjonarnie</Radio>
                            </RadioGroup> */}
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
                                    setValue("timeZone", key.toString(), {shouldValidate: true})
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
                                        setRegion(null)
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
                                        setValue("cityId", cityId ? cityId.toString() : null, {shouldValidate: true})
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
                                    onValueChange={(value) => {setValue("street", value || null, {shouldValidate: true})}}
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
                                setValue("plannedWeekday", key === "null" ? null : (key as WeekDay), { shouldValidate: true });
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
                                        setValue("hours.start", `${time.hour.toString().padStart(2,'0')}:${time.minute.toString().padStart(2,'0')}`, {shouldValidate: true})
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
                                        setValue("hours.end", `${time.hour.toString().padStart(2,'0')}:${time.minute.toString().padStart(2,'0')}`, {shouldValidate: true})
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
                            onValueChange={(value) => setValue("frequencyWeeks", value ?? null, { shouldValidate: true })}
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
                            onValueChange={(value) => {setValue("newUserPrice", value, {shouldValidate: true})}}
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
                            onValueChange={(value) => {setValue("price", value, {shouldValidate: true})}}
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
                                isDisabled={isSubmitting || !isValid}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Utwórz nowy krąg"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    );
}
export default CreateCircleModal;