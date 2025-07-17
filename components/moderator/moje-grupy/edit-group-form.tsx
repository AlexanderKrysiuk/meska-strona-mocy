"use client"

import { EditGroup } from "@/actions/group"
import { EditGroupSchema } from "@/schema/group"
import { ActionStatus } from "@/types/enums"
import { finalSlugify, liveSlugify } from "@/utils/slug"
import { Button, Form, Input, Select, SelectItem, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { City, Country, Group, Region } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditGroupForm = ({
    group,
    countries,
    regions,
    cities
} : {
    group: Group
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const router = useRouter()

    const city = cities.find(city => city.id === group.cityId)
    const region = regions.find(region => region.id === city?.regionId)
    const country = countries.find(country => country.id === region?.countryId)

    const [cityId, setCityId] = useState(city?.id || "")
    const [regionId, setRegionId] = useState(region?.id || "")
    const [countryId, setCountryId] = useState(country?.id || "")

    // const [cityId, setCityId] = useState(() => {
    //     if (!group.cityId) return "";
    //     const city = cities.find(c => c.id === group.cityId);
    //     return city?.id ?? "";
    // });
    
    // const [regionId, setRegionId] = useState(() => {
    //     if (!group.cityId) return "";
    //     const city = cities.find(c => c.id === group.cityId);
    //     const region = regions.find(r => r.id === city?.regionId);
    //     return region?.id ?? "";
    // });
    
    // const [countryId, setCountryId] = useState(() => {
    //     if (!group.cityId) return "";
    //     const city = cities.find(c => c.id === group.cityId);
    //     const region = regions.find(r => r.id === city?.regionId);
    //     const country = countries.find(c => c.id === region?.countryId);
    //     return country?.id ?? "";
    // });
    

    type FormFields = z.infer<typeof EditGroupSchema>

    const { register, reset, watch, setValue, setError, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid } } = useForm<FormFields>({
        resolver: zodResolver(EditGroupSchema),
        defaultValues: {
            name: group.name,
            slug: group.slug ?? undefined,
            maxMembers: group.maxMembers,
            street: group.street ?? undefined,
            cityId: group.cityId ?? undefined,
            price: group.price ?? undefined
        }
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        try {
            const result = await EditGroup(group.id, data)

            if (result.errors) {
                for (const [field, messages] of Object.entries(result.errors)) {
                    setError(field as keyof FormFields, {message: messages.join(", ")})
                }
            }

            addToast({
                title: result.message,
                color: result.status,
                variant: "bordered"
            })

            if (result.status === ActionStatus.Success) {
                reset(data)
                router.refresh()
            }
            
        } catch {
            addToast({
                title: "Wystąpił nieznany błąd",
                color: "danger",
                variant: "bordered"
            })
        }
    }

    return (
        <main className="space-y-4">
            <Form onSubmit={handleSubmit(submit)}>
                <Input {...register("name")}
                    label="Nazwa grupy"
                    labelPlacement="outside"
                    type="text"
                    placeholder="Załoga Czarnej Perły"
                    variant="bordered"
                    onValueChange={(value)=> setValue("slug", liveSlugify(value))}
                    isClearable
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                />
                <Input {...register("slug")}
                    label="Unikalny odnośnik"
                    labelPlacement="outside"
                    type="text"
                    placeholder="zaloga-czarnej-perly"
                    description="Ten odnośnik będzie częścią adresu URL Twojej grupy (np. meska-strona-mocy.pl/meskie-kregi/nazwa-grupy). Użyj krótkiej, łatwej do zapamiętania nazwy bez polskich znaków. Odnośnik powinien być unikalny."
                    variant="bordered"
                    value={watch("slug")}
                    onValueChange={(value) => setValue("slug", liveSlugify(value))}
                    onBlur={(event) => {setValue("slug", finalSlugify(event.target.value))}}
                    isClearable
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.slug}
                    errorMessage={errors.slug?.message}
                />
                <Input {...register("maxMembers", {valueAsNumber: true})}
                    label="Maksymalna liczba uczestników"
                    labelPlacement="outside"
                    type="number"
                    placeholder="11"
                    variant="bordered"
                    min={1}
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.maxMembers}
                    errorMessage={errors.maxMembers?.message}
                />
                <Input {...register("street")}
                    label="Adres (ulica, numer domu / lokalu)"
                    labelPlacement="outside"
                    type="text"
                    placeholder="Tortuga 13/7"
                    variant="bordered"
                    isClearable
                    isDisabled={isSubmitting}
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
                        setCityId("")
                        setValue("cityId", undefined)
                    }}
                    isDisabled={isSubmitting}
                    items={countries}
                >
                    {(countries) => <SelectItem key={countries.id}>{countries.name}</SelectItem>}
                </Select>
                <Select
                    label="Województwo"
                    labelPlacement="outside"
                    placeholder="Archipelag Czarnej Perły"
                    variant="bordered"
                    selectedKeys={[regionId]}
                    onChange={(event) => {
                        setRegionId(event.target.value)
                        setCityId("")
                        setValue("cityId", undefined)
                    }}
                    isDisabled={isSubmitting || !countryId}
                    items={regions.filter(region => region.countryId === countryId)}
                >
                    {(regions) => <SelectItem>{regions.name}</SelectItem>}
                </Select>
                <Select {...register("cityId")}
                    label="Miasto"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="Isla de Muerta"
                    selectedKeys={[cityId]}
                    onChange={(event)=>{
                        setCityId(event.target.value)
                        setValue("cityId", event.target.value)
                    }}
                    isDisabled={isSubmitting || !countryId || !regionId}
                    isInvalid={!!errors.cityId}
                    errorMessage={errors.cityId?.message}
                    items={cities.filter(city => city.regionId === regionId)}
                >
                    {(cities) => <SelectItem>{cities.name}</SelectItem>}
                </Select>
                <Input {...register("price", {valueAsNumber: true})}
                    label="Cena"
                    labelPlacement="outside"
                    variant="bordered"
                    type="number"
                    min={0}
                    placeholder="150"
                    endContent={
                        <div className="text-foreground-500 text-sm">
                            PLN
                        </div>
                    }
                    isClearable
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                />
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={isSubmitting || !isDirty || !isValid}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Zmień dane grupy"}
                </Button>
            </Form>
        </main>
    )
}

export default EditGroupForm