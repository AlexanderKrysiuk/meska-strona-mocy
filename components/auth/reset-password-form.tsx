"use client"

import { ResetPassword } from "@/actions/auth"
import { ResetPasswordSchema } from "@/schema/user"
import { Button, Form, Input, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type FormFields = z.infer<typeof ResetPasswordSchema>

const ResetPasswordForm = () => {
    const { handleSubmit, watch, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(ResetPasswordSchema)
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        const result = await ResetPassword(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            <Input
                label="Email"
                labelPlacement="outside"
                type="email"
                autoComplete="email"
                value={watch("email")}
                onValueChange={(value) => setValue("email", value, {shouldValidate: true})}
                placeholder="jack.sparrow@piratebay.co.uk"
                variant="bordered"
                isClearable
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
            />
            <Button
                type="submit"
                color="primary"
                fullWidth
                isDisabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
            >
                {isSubmitting ? "Przetwarzanie..." : "Resetuj hasło"}
            </Button>
        </Form>
    )
}
export default ResetPasswordForm;