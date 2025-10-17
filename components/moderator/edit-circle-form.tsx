"use client"

import { EditCircle, GetModeratorCircles } from "@/actions/circle"
import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { EditCircleSchema } from "@/schema/circle"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { liveSlugify } from "@/utils/slug"
import { Button, Form, Input, NumberInput, Select, SelectItem, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Country, Currency, Region } from "@prisma/client"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../loader"
import CreateCircleModal from "./create-circle-modal"

const EditCircleForm = () => {
    const moderator = clientAuth()

    const queries = useQueries({
        queries: [
            {
                queryKey: [ModeratorQueries.Circles, moderator?.id],
                queryFn: () => GetModeratorCircles(moderator!.id),
                enabled: !!moderator
            },
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

    const [circles, countries, regions, cities] = queries

    const [region, setRegion] = useState<Region | undefined>();
    const [country, setCountry] = useState<Country | undefined>();

    type FormFields = z.infer<typeof EditCircleSchema>

    const { reset, watch, setValue, setError, trigger, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid }} = useForm<FormFields>({
        resolver: zodResolver(EditCircleSchema),
        mode: "all"
    })

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

    if (queries.some(q => q.isLoading || !q.data)) return <Loader/>

    return (
            <Form onSubmit={handleSubmit(submit)}>
                <div className="flex space-x-4 items-center w-full">
                <Select
                    label="Krąg"
                    items={circles.data}
                    placeholder="Wybierz krąg"
                    variant="bordered"
                    onSelectionChange={(keys) => {
                        const id = Array.from(keys)[0];
                        const circle = circles.data?.find(c => c.id === id)
                        reset (
                            {
                                circleId: circle?.id,
                                name: circle?.name,
                                slug: circle?.slug,
                                members: {
                                    max: circle?.maxMembers,
                                    min: circle?.minMembers
                                },
                                street: circle?.street,
                                cityId: circle?.cityId,
                                price: circle?.price,
                                currency: circle?.currency
                            },
                            {keepErrors: true}
                        )
                        const city = cities.data?.find(c => c.id === watch("cityId"))
                        const region = regions.data?.find(r => r.id === city?.regionId)
                        const country = countries.data?.find(c => c.id === region?.countryId)
    
                        setRegion(region)
                        setCountry(country)                
                    }}
                    isDisabled={!circles.data || circles.data?.length < 1}
                    hideEmptyContent
                >
                    {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                </Select>
                <CreateCircleModal/>
            </div>
                <Input
                    label="Nazwa grupy"
                    labelPlacement="outside"
                    type="text"
                    placeholder="Załoga Czarnej Perły"
                    variant="bordered"
                    value={watch("name")}
                    onValueChange={(value) => {
                        setValue("name", value, {shouldDirty: true, shouldValidate: true})
                        setValue("slug", liveSlugify(value), {shouldDirty: true, shouldValidate: true})
                    }}
                    isClearable
                    isRequired
                    isDisabled={!watch("circleId") || isSubmitting}
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
                    onValueChange={(value) => {setValue("slug", liveSlugify(value), {shouldDirty: true ,shouldValidate: true})}}
                    isClearable
                    isRequired
                    isDisabled={!watch("circleId") || isSubmitting}
                    isInvalid={!!errors.slug}
                    errorMessage={errors.slug?.message}
                />
                <NumberInput
                    label="Maksymalna liczba uczestników"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="11"
                    minValue={1}
                    maxValue={15}
                    formatOptions={{ maximumFractionDigits: 0 }}
                    value={watch("members.max")}
                    onValueChange={(value) => {
                        setValue("members.max", value, {shouldDirty:true, shouldValidate: true})
                        trigger("members.min")
                    }}
                    isClearable
                    isRequired
                    isDisabled={!watch("circleId") || isSubmitting}
                    isInvalid={!!errors.members?.max || !!errors.members}
                    errorMessage={errors.members?.max?.message || !!errors.members?.message}
                />
                <NumberInput
                    label="Minimalna liczba uczestników"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="1"
                    minValue={1}
                    maxValue={15}
                    formatOptions={{ maximumFractionDigits: 0 }}
                    value={watch("members.min")}
                    onValueChange={(value) => {
                        setValue("members.min", value, {shouldDirty:true, shouldValidate: true})
                        trigger("members.max")
                    }}
                    isClearable
                    isRequired
                    isDisabled={!watch("circleId") || isSubmitting}
                    isInvalid={!!errors.members?.min || !!errors.members}
                    errorMessage={errors.members?.min?.message || !!errors.members?.message}
                />
                <Input
                    label="Adres (ulica, numer)"
                    labelPlacement="outside"
                    placeholder="Tortuga 13/7"
                    variant="bordered"
                    type="text"
                    value={watch("street") || ""}
                    onValueChange={(value) => {setValue("street", value || null, {shouldDirty:true, shouldValidate: true})}}
                    isClearable
                    isDisabled={!watch("circleId") || isSubmitting}
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
                        reset (
                            {
                                circleId: watch("circleId"),
                                name: watch("name"),
                                slug: watch("slug"),
                                members: {
                                    max: watch("members.max"),
                                    min: watch("members.min")
                                },
                                street: watch("street"),
                                cityId: null,
                                price: watch("price"),
                                currency: watch("currency")
                            },
                            {keepErrors: true}
                        )
                    }}  
                    isDisabled={!watch("circleId") || isSubmitting}
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
                        reset (
                            {
                                circleId: watch("circleId"),
                                name: watch("name"),
                                slug: watch("slug"),
                                members: {
                                    max: watch("members.max"),
                                    min: watch("members.min")
                                },
                                street: watch("street"),
                                cityId: null,
                                price: watch("price"),
                                currency: watch("currency")
                            },
                            {keepErrors: true}
                        )
                    }}  
                    isDisabled={!watch("circleId") || isSubmitting || !country}
                    items={regions.data?.filter(region => region.countryId === country?.id)}
                    >
                    {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                </Select>
                <Select
                    label="Miasto"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="Isla de Muerta"
                    selectedKeys={[watch("cityId")!]}
                    hideEmptyContent
                    disallowEmptySelection
                    onSelectionChange={(keys) => {setValue("cityId", Array.from(keys)[0].toString(), {shouldValidate: true, shouldDirty: true})}}
                    isDisabled={!watch("circleId") || !region || !country || isSubmitting}
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
                    placeholder="150"
                    minValue={0}
                    value={watch("price")!}
                    onValueChange={(value) => {setValue("price", value ?? null, {shouldDirty:true, shouldValidate: true})}}
                    endContent={
                        <select
                            value={watch("currency") ?? ""}
                            onChange={(event) => {
                                const val = event.target.value as Currency;
                                setValue("currency", val , { shouldValidate: true, shouldDirty: true });
                            }}
                        >
                            <option value={null!}>Brak</option> {/* opcja brak */}
                            {Object.values(Currency).map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    }
                    isClearable
                    isDisabled={!watch("circleId") || isSubmitting}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}    
                />
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={!watch("circleId") || isSubmitting || !isDirty || !isValid}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Zmień dane kręgu"}
                </Button>
            </Form>
    )
}

export default EditCircleForm
