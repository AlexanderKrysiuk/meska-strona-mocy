"use client"

import { ResetPassword } from "@/actions/auth"
import { ResetPasswordSchema } from "@/schema/user"
import { Alert, Button, Form, Input, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type FormFields = z.infer<typeof ResetPasswordSchema>

const ResetPasswordForm = () => {
    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(ResetPasswordSchema)
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        try {
            await ResetPassword(data)
            addToast({
                title: "Wysłano e-mail do resetu hasła",
                color: "success",
                variant: "bordered"
            })
        } catch(error) {
            setError("root", {message: error instanceof Error ? error.message : "Wystąpił nieznany błąd"})
        }
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            <Input {...register("email")}
                label="Email"
                labelPlacement="outside"
                type="email"
                autoComplete="email"
                placeholder="jack.sparrow@piratebay.co.uk"
                variant="bordered"
                isClearable
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.email || !!errors.root}
                errorMessage={errors.email?.message}
            />
            {errors.root && (
                <Alert
                    title={errors.root.message}
                    color="danger"
                    variant="bordered"
                />
            )}
            <Button
                type="submit"
                color="primary"
                fullWidth
                isDisabled={isSubmitting || !watch("email")}
                isLoading={isSubmitting}
                className="text-white"
            >
                {isSubmitting ? "Przetwarzanie..." : "Resetuj hasło"}
            </Button>
        </Form>
    )
}
export default ResetPasswordForm;