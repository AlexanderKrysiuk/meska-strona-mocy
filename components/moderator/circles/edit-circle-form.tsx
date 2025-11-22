"use client"

import { EditCircle, GetModeratorCircles } from "@/actions/circle"
import { GetCities } from "@/actions/city"
import { GetCountries } from "@/actions/country"
import { GetRegions } from "@/actions/region"
import { clientAuth } from "@/hooks/auth"
import { EditCircleSchema } from "@/schema/circle"
import { GeneralQueries, ModeratorQueries } from "@/utils/query"
import { liveSlugify } from "@/utils/slug"
import { Button, Form, Input, NumberInput, Radio, RadioGroup, Select, SelectItem, Selection, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Circle, Country, Currency, Region } from "@prisma/client"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "../../loader"

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

    useEffect(() => {      
        const circle = circles.data?.find(c => c.id === watch("circleId"))

        reset({
            circleId: circle?.id,
            name: circle?.name,
            slug: circle?.slug,
            members: {
                max: circle?.maxMembers,
                min: circle?.minMembers
            },
            street: circle?.street,
            cityId: circle?.city?.id,
            isPublic: circle?.public,
            price: circle?.price,
            newUserPrice: circle?.newUserPrice,
            currency: circle?.currency
        });

        const city = cities.data?.find(c => c.id === circle?.city?.id)
        const region = regions.data?.find(r => r.id === city?.regionId)
        const country = countries.data?.find(c => c.id === region?.countryId)
        setRegion(region)
        setCountry(country)

    }, [watch("circleId"), reset, cities.data, regions.data, countries.data]);

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

    return <Form onSubmit={handleSubmit(submit)}>
        <Select
            label="Krąg"
            labelPlacement="outside"
            items={circles.data}
            variant="bordered"
            placeholder="Wybierz krąg"
            onSelectionChange={(keys) => {
                const id = Array.from(keys)[0]
                setValue("circleId", id as string)
            }}
            isDisabled={!circles}
            hideEmptyContent
        >
            {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
        </Select>
        <Input
            label="Nazwa kręgu"
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
                setValue("cityId", null, {shouldValidate: true, shouldDirty: true,})
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
                setValue("cityId", null, {shouldValidate: true, shouldDirty: true,})
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
            onSelectionChange={(keys) => {
                const cityId = Array.from(keys)[0]
                setValue("cityId", cityId ? cityId.toString() : null, {shouldValidate: true, shouldDirty: true})
            }}
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
            isClearable
            isDisabled={!watch("circleId") || isSubmitting}
            isInvalid={!!errors.price}
            errorMessage={errors.price?.message}    
        />
        <NumberInput
            label="Cena dla nowego kręgowca"
            labelPlacement="outside"
            variant="bordered"
            placeholder="150"
            minValue={0}
            value={watch("newUserPrice") ?? undefined}
            onValueChange={(value) => setValue("newUserPrice", value ?? null, {shouldDirty: true, shouldValidate: true})}
            isClearable
            isDisabled={!watch("circleId") || isSubmitting}
            isInvalid={!!errors.newUserPrice}
            errorMessage={errors.newUserPrice?.message}
        />
        <Select
            label="Waluta"
            labelPlacement="outside"
            variant="bordered"
            placeholder="PLN"
            selectedKeys={[watch("currency")!]}
            hideEmptyContent     
            onSelectionChange={(keys) => {setValue("currency", Array.from(keys)[0] as Currency ?? null, {shouldValidate: true, shouldDirty: true})}}
            isDisabled={!watch("circleId")}
            isInvalid={!!errors.currency}
            errorMessage={errors.currency?.message}
        >
            {Object.values(Currency).map((c) => (
                <SelectItem key={c}>{c}</SelectItem>
            ))}
        </Select>
        <RadioGroup
            label="Widoczność kręgu"
            orientation="horizontal"
            value={watch("isPublic") ? "public" : "private"}
            onValueChange={(val) => setValue("isPublic", val === "public", { shouldValidate: true, shouldDirty: true,})}
            isDisabled={!watch("circleId") || isSubmitting}
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
        <Button
            type="submit"
            color="primary"
            isDisabled={!watch("circleId") || isSubmitting || !isDirty || !isValid}
            isLoading={isSubmitting}
            className="mt-4"
        >
            {isSubmitting ? "Przetwarzanie..." : "Zmień dane kręgu"}
        </Button>
    </Form>
}

export default EditCircleForm
