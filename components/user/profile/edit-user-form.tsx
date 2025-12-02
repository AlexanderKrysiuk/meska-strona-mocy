"use client"

import { UpdateUser } from "@/actions/user";
import { clientAuth } from "@/hooks/auth";
import { EditUserSchema } from "@/schema/user";
import { UserQueries } from "@/utils/query";
import { liveSlugify } from "@/utils/slug";
import { Button, Form, Input, Textarea, addToast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

const EditUserForm = ({
    user
} : {
    user: Pick<User, "name" | "description" | "slug">
}) => {
    const auth = clientAuth()

    type FormFields = z.infer<typeof EditUserSchema>
    const { reset, watch, setValue, setError, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid }} = useForm<FormFields>({
        resolver: zodResolver(EditUserSchema),
        mode: "all",
        defaultValues: {
            //name: user.name,
            description: user.description,
            slug: user.slug,
        }
    })

    const queryClient = useQueryClient()

    const submit: SubmitHandler<FormFields> = async (data) => {
        const result = await UpdateUser(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger"
        })

        if (result.success) {
            queryClient.invalidateQueries({queryKey: [UserQueries.User, auth?.id]})
            reset(data)
        } else {
            if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof FormFields, { type: "manual", message})
                })
            }
        }
    }

    return <Form onSubmit={handleSubmit(submit)}>
        {/* {JSON.stringify(watch(),null,2)} */}
        {/* <pre>
            Watch: {JSON.stringify(watch(),null,2)}
        </pre> */}
        <Input
            label="Imię i Nazwisko"
            labelPlacement="outside"
            isClearable
            variant="bordered"
            value={watch("name") ?? ""}
            //onValueChange={(value) => setValue("name", value || null, { shouldDirty:true, shouldValidate: true})}
            isDisabled={isSubmitting}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
        />
        {(auth?.roles ?? []).length > 0 &&
        <>
                    <Input
                label="Unikalny odnośnik"
                labelPlacement="outside"
                placeholder="Kapitan-Jack-Sparrow"
                description="Ten odnośnik będzie częścią adresu URL Twojego profilu"
                variant="bordered"
                value={watch("slug") ?? ""}
                onValueChange={(value) => setValue("slug", liveSlugify(value) || null, {shouldDirty: true, shouldValidate: true})}
                isClearable
                isDisabled={isSubmitting}
                isInvalid={!!errors.slug}
                errorMessage={errors.slug?.message}
            />
            
        <Textarea
        label="Opis"
        labelPlacement="outside"
        isClearable
        variant="bordered"
        value={watch("description") ?? ""}
        onValueChange={(value) => setValue("description", value || null, {shouldDirty: true, shouldValidate: true})}
        isDisabled={isSubmitting}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message}
        />
        </>
        }
        <Button
            type="submit"
            color="primary"
            isDisabled={!isDirty || !isValid || isSubmitting}
            isLoading={isSubmitting}
        >
            {isSubmitting ? "Przetwarzanie..." : "Zmień dane"}
        </Button>
    </Form>

}
 
export default EditUserForm;