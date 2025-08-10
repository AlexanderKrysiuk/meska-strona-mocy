"use client"

import { EditCircle } from "@/actions/circle"
import { EditCircleSchema } from "@/schema/circle"
import { liveSlugify } from "@/utils/slug"
import { Button, Form, Input, NumberInput, Select, SelectItem, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { City, Country, Circle, Region } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditCircleForm = ({
    circle,
    countries,
    regions,
    cities
} : {
    circle?: Circle
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const router = useRouter()

    const city = cities.find(city => city.id === circle?.cityId)
    const region = regions.find(region => region.id === city?.regionId)
    const country = countries.find(country => country.id === region?.countryId)

    const [cityId, setCityId] = useState(circle?.cityId || "")
    const [regionId, setRegionId] = useState(region?.id || "")
    const [countryId, setCountryId] = useState(country?.id || "")

    type FormFields = z.infer<typeof EditCircleSchema>

    const { reset, watch, setValue, setError, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid }} = useForm<FormFields>({
        resolver: zodResolver(EditCircleSchema),
        mode: "all",
        defaultValues: {
            circleId: circle?.id,
            name: circle?.name,
            slug: circle?.slug,
            maxMembers: circle?.maxMembers,
            street: circle?.street ?? null,
            cityId: circle?.cityId ?? null,
            price: circle?.price ?? null
        }
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        if (!circle) return

        const result = await EditCircle(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })

        if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
                setError(field as keyof FormFields, { message: messages.join(", ") })
            })
        } else {
            reset(data)
            router.refresh()
        }      
    }

    return (
        <main className="space-y-4">
            <Form onSubmit={handleSubmit(submit)}>
                {/* <Divider/>
                {JSON.stringify(watch(),null,2)}<br/>
                Valid: {JSON.stringify(isValid,null,2)}<br/>
                Dirty: {JSON.stringify(isDirty,null,2)}<br/>
                <Divider/> */}
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
                    isDisabled={!circle || isSubmitting}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                />
                <Input
                    label="Unikalny odnośnik"
                    labelPlacement="outside"
                    type="text"
                    placeholder="zaloga-czarnej-perly"
                    description="Ten odnośnik będzie częścią adresu URL Twojej grupy."
                    variant="bordered"
                    value={watch("slug")}
                    onValueChange={(value) => {setValue("slug", liveSlugify(value), {shouldDirty: true ,shouldValidate: true})}}
                    isClearable
                    isRequired
                    isDisabled={!circle || isSubmitting}
                    isInvalid={!!errors.slug}
                    errorMessage={errors.slug?.message}
                />
                <NumberInput
                    label="Maksymalna liczba uczestników"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="11"
                    minValue={0}
                    maxValue={15}
                    formatOptions={{ maximumFractionDigits: 0 }}
                    value={watch("maxMembers")}
                    onValueChange={(value) => {setValue("maxMembers", value, {shouldDirty:true, shouldValidate: true})}}
                    isClearable
                    isRequired
                    isDisabled={!circle || isSubmitting}
                    isInvalid={!!errors.maxMembers}
                    errorMessage={errors.maxMembers?.message}
                />
                <Input
                    label="Adres (ulica, numer)"
                    labelPlacement="outside"
                    placeholder="Tortuga 13/7"
                    variant="bordered"
                    type="text"
                    value={watch("street") || undefined}
                    onValueChange={(value) => {setValue("street", value || null, {shouldDirty:true, shouldValidate: true})}}
                    isClearable
                    isDisabled={!circle || isSubmitting}
                    isInvalid={!!errors.street}
                    errorMessage={errors.street?.message}
                />
                <Select
                    label="Kraj"
                    labelPlacement="outside"
                    placeholder="Karaiby"
                    variant="bordered"
                    selectedKeys={[countryId]}
                    onChange={(event) => {
                        setCountryId(event.target.value)
                        setRegionId("")
                        setValue("cityId", null, { shouldDirty: true })
                    }}
                    isDisabled={!circle || isSubmitting}
                    items={countries}
                    >
                    {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
                </Select>
                <Select
                    label="Województwo"
                    labelPlacement="outside"
                    placeholder="Archipelag Czarnej Perły"
                    variant="bordered"
                    selectedKeys={[regionId]}
                    onChange={(event) => {
                        setRegionId(event.target.value)
                        setValue("cityId", null, { shouldDirty: true })
                    }}
                    isDisabled={!circle || isSubmitting || !countryId}
                    items={regions.filter(region => region.countryId === countryId)}
                    >
                    {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                </Select>
                <Select
                    label="Miasto"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="Isla de Muerta"
                    selectedKeys={[cityId]}
                    onChange={(event) => {
                        setCityId(event.target.value)
                        setValue("cityId", event.target.value || null, { shouldDirty: true })
                    }}
                    isDisabled={!circle || isSubmitting || !countryId || !regionId}
                    isInvalid={!!errors.cityId}
                    errorMessage={errors.cityId?.message}
                    items={cities.filter(city => city.regionId === regionId)}
                    >
                    {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
                </Select>
                <NumberInput 
                    label="Cena"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="150"
                    minValue={0}
                    formatOptions={{
                        style: "currency",
                        currency: "PLN"
                    }}
                    value={watch("price")!}
                    onValueChange={(value) => {setValue("price", value ?? null, {shouldDirty:true, shouldValidate: true})}}
                    isClearable
                    isDisabled={!circle || isSubmitting}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}    
                />
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={!circle || isSubmitting || !isDirty || !isValid}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Zmień dane kręgu"}
                </Button>
            </Form>
        </main>
    )
}

export default EditCircleForm
