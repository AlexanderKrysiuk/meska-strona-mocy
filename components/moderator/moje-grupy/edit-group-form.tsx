"use client"

import { EditGroup } from "@/actions/group"
import { EditGroupSchema } from "@/schema/group"
import { ActionStatus } from "@/types/enums"
import { finalNameify, finalSlugify, liveNameify, liveSlugify, numberify } from "@/utils/slug"
import { Button, Form, Input, Select, SelectItem, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { City, Country, Group, Region } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditGroupForm2 = ({
    group,
    countries,
    regions,
    cities
}: {
    group?: Group
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const router = useRouter()

    const city = cities.find(city => city.id === group?.cityId)
    const region = regions.find(region => region.id === city?.regionId)
    const country = countries.find(country => country.id === region?.countryId)

    const [cityId, setCityId] = useState(group?.cityId || "")
    const [regionId, setRegionId] = useState(region?.id || "")
    const [countryId, setCountryId] = useState(country?.id || "")

    type FormFields = z.infer<typeof EditGroupSchema>

    const {
        register,
        reset,
        watch,
        setValue,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useForm<FormFields>({
        resolver: zodResolver(EditGroupSchema),
        mode: "all",
        defaultValues: {
            name: group?.name || "",
            slug: group?.slug || "",
            maxMembers: group?.maxMembers || undefined,
            street: group?.street ?? null,
            cityId: group?.cityId ?? null,
            price: group?.price ?? null
        }
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        if (!group) return

        try {
            const result = await EditGroup(group.id, data)

            if (result.errors) {
                for (const [field, messages] of Object.entries(result.errors)) {
                    setError(field as keyof FormFields, { message: messages.join(", ") })
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
                <Input
                    {...register("name", {
                        setValueAs(value) {
                            return liveNameify(value)
                        },
                        onChange(event) {
                            setValue("slug", liveSlugify(event.target.value), { shouldValidate: true })
                        },
                        onBlur(event) {
                            setValue("name", finalNameify(event.target.value), { shouldValidate: true })
                            setValue("slug", finalNameify(event.target.value), { shouldValidate: true })
                        }
                    })}
                    label="Nazwa grupy"
                    labelPlacement="outside"
                    type="text"
                    placeholder="Załoga Czarnej Perły"
                    variant="bordered"
                    isDisabled={!group || isSubmitting}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                />

                <Input
                    {...register("slug", {
                        setValueAs(value) {
                            return liveSlugify(value)
                        },
                        onBlur(event) {
                            setValue("slug", finalSlugify(event.target.value), { shouldValidate: true })
                        }
                    })}
                    label="Unikalny odnośnik"
                    labelPlacement="outside"
                    type="text"
                    placeholder="zaloga-czarnej-perly"
                    description="Ten odnośnik będzie częścią adresu URL Twojej grupy."
                    variant="bordered"
                    value={watch("slug")}
                    isDisabled={!group || isSubmitting}
                    isInvalid={!!errors.slug}
                    errorMessage={errors.slug?.message}
                />

                <Input
                    {...register("maxMembers", { setValueAs: numberify })}
                    label="Maksymalna liczba uczestników"
                    labelPlacement="outside"
                    variant="bordered"
                    min={1}
                    placeholder="11"
                    value={watch("maxMembers")?.toString() || ""}
                    isRequired
                    isDisabled={!group || isSubmitting}
                    isInvalid={!!errors.maxMembers}
                    errorMessage={errors.maxMembers?.message}
                />

                <Input
                    {...register("street", {
                        setValueAs: (value) => {
                            if (value === null || value.trim() === "") return null
                            return liveNameify(value)
                        }
                    })}
                    label="Adres (ulica, numer)"
                    labelPlacement="outside"
                    placeholder="Tortuga 13/7"
                    variant="bordered"
                    type="text"
                    value={watch("street")?.toString() || ""}
                    isDisabled={!group || isSubmitting}
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
                    isDisabled={!group || isSubmitting}
                    items={countries}
                >
                    {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
                </Select>

                <Select
                    label="Województwo"
                    labelPlacement="outside"
                    placeholder="Archipelag"
                    variant="bordered"
                    selectedKeys={[regionId]}
                    onChange={(event) => {
                        setRegionId(event.target.value)
                        setValue("cityId", null, { shouldDirty: true })
                    }}
                    isDisabled={!group || isSubmitting || !countryId}
                    items={regions.filter(region => region.countryId === countryId)}
                >
                    {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                </Select>

                <Select
                    {...register("cityId")}
                    label="Miasto"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="Isla de Muerta"
                    selectedKeys={[cityId]}
                    onChange={(event) => {
                        setCityId(event.target.value)
                        setValue("cityId", event.target.value || null, { shouldDirty: true })
                    }}
                    isDisabled={!group || isSubmitting || !countryId || !regionId}
                    isInvalid={!!errors.cityId}
                    errorMessage={errors.cityId?.message}
                    items={cities.filter(city => city.regionId === regionId)}
                >
                    {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
                </Select>

                <Input
                    {...register("price", { setValueAs: numberify })}
                    value={watch("price")?.toString() || ""}
                    label="Cena"
                    labelPlacement="outside"
                    variant="bordered"
                    min={0}
                    placeholder="150"
                    endContent={<div className="text-foreground-500 text-sm">PLN</div>}
                    isClearable
                    isDisabled={!group || isSubmitting}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                />
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={!group || isSubmitting || !isDirty || !isValid}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Zmień dane grupy"}
                </Button>
            </Form>
        </main>
    )
}

export default EditGroupForm2
