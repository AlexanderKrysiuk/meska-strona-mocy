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
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Radio, RadioGroup, Select, SelectItem, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, Region, WeekDay } from "@prisma/client";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
    const [isOnline, setIsOnline] = useState(true);

    const { handleSubmit, watch, trigger, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(CreateCircleSchema)
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
            >
                <ModalContent>
                    <ModalHeader>Nowy krąg</ModalHeader>
                    {/* <pre>

                    {JSON.stringify(watch(),null,2)}<br/>
                    CountryID: {JSON.stringify(country,null,2)}<br/>
                    Region: {JSON.stringify(region,null,2)}

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
                                placeholder="11"
                                minValue={1}
                                formatOptions={{ maximumFractionDigits: 0 }}
                                value={watch("members.max")}
                                onValueChange={(value) => {
                                    setValue("members.max", value, {shouldDirty:true, shouldValidate: true})
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
                                placeholder="1"
                                minValue={1}
                                formatOptions={{ maximumFractionDigits: 0 }}
                                value={watch("members.min")}
                                onValueChange={(value) => {
                                    setValue("members.min", value, {shouldDirty:true, shouldValidate: true})
                                    trigger("members.max")
                                }}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.members?.min || !!errors.members}
                                errorMessage={errors.members?.min?.message || !!errors.members?.message}
                            />
                            Dane Adresowe:
                            <Divider/>
                            <RadioGroup
                                label="Rodzaj kręgu"
                                orientation="horizontal"
                                value={isOnline ? "online" : "offline"}
                                onValueChange={(value) => {
                                    const online = value === "online"
                                    setIsOnline(online)
                                
                                    if (online) {  // jeśli teraz wybieramy online, czyścimy pola
                                        setCountry(null)
                                        setRegion(null)
                                        setValue("cityId", null)
                                        setValue("street", null)
                                    }
                                }}
                            >
                                <Radio value="online">Online</Radio>
                                <Radio value="offline">Stacjonarnie</Radio>
                            </RadioGroup>
                            {!isOnline && <>
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
                                    isDisabled={isSubmitting || isOnline}
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
                                    isDisabled={isSubmitting || !country || isOnline}
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
                                    isDisabled={!region || !country || isSubmitting || isOnline}
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
                                    onValueChange={(value) => {setValue("street", value || null, {shouldDirty:true, shouldValidate: true})}}
                                    isClearable
                                    isDisabled={isSubmitting || isOnline}
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
                            placeholder="Piątunio"
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
                                { key: "null", label: "Nie wybrano" }, // opcja dla null
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