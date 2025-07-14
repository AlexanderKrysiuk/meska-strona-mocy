"use client"

import { EditGroup } from "@/actions/group"
import { EditGroupSchema } from "@/schema/group"
import { ActionStatus } from "@/types/enums"
import { finalSlugify, liveSlugify } from "@/utils/slug"
import { Button, Form, Input, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Group } from "@prisma/client"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const EditGroupForm = ({
    group
} : {
    group: Group
}) => {
    const router = useRouter()

    type FormFields = z.infer<typeof EditGroupSchema>

    const { register, reset, watch, setValue, setError, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormFields>({
        resolver: zodResolver(EditGroupSchema),
        defaultValues: {
            name: group.name,
            slug: group.slug ?? undefined,
            maxMembers: group.maxMembers
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
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={isSubmitting || !isDirty || Object.keys(errors).length > 0}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Zmień dane grupy"}
                </Button>
            
            </Form>
        </main>
    )
}

export default EditGroupForm