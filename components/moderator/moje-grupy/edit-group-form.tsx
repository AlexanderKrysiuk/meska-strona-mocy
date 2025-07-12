"use client"

import { EditGroup } from "@/actions/group"
import { EditGroupSchema } from "@/schema/group"
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

    const { register, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(EditGroupSchema),
        defaultValues: group
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        //console.log(data)
        try {
            const result = await EditGroup(group.id, data)

            addToast({
                title: result.message,
                color: result.success ? "success" : "danger",
                variant: "bordered"
            })
            router.refresh()
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
                    isClearable
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                />
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={isSubmitting || watch("name") === group.name || !watch("name")}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? "Przetwarzanie..." : "Zmień dane grupy"}
                </Button>
            </Form>
        </main>
    )
}

export default EditGroupForm