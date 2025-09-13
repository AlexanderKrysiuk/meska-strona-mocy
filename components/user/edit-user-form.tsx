"use client"

import { UpdateUser } from "@/actions/user";
import { clientAuth } from "@/hooks/auth";
import { EditUserSchema } from "@/schema/user";
import { UserQueries } from "@/utils/query";
import { Button, Form, Textarea, addToast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

const EditUserForm = ({
    user
} : {
    user: Pick<User, "name" | "description">
}) => {
    const auth = clientAuth()

    type FormFields = z.infer<typeof EditUserSchema>
    const { reset, watch, setValue, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid }} = useForm<FormFields>({
        resolver: zodResolver(EditUserSchema),
        mode: "all",
        defaultValues: {
            description: user.description
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
        }
    }

    return <Form onSubmit={handleSubmit(submit)}>
        {/* <pre>
            Watch: {JSON.stringify(watch(),null,2)}
        </pre> */}
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