"use client"

import { RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Form, Input } from "@heroui/react";

type FormFields = z.infer<typeof RegisterSchema>

const RegisterForm = () => {
    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(RegisterSchema)
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        console.log(data)
        setError("root", { message: "raz" })
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            <Input {...register("name")}
                label="Imię i nazwisko"
                labelPlacement="outside"
                type="text"
                autoComplete="name"
                placeholder="Jack Sparrow"
                variant="bordered"
                isClearable
                isDisabled={isSubmitting}
                isInvalid={!!errors.name || !!errors.root}
                errorMessage={errors.name?.message}
            />
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
                    variant="bordered"
                    color="danger"
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
                {isSubmitting ? "Przetwarzanie..." : "Załóż konto"}
            </Button>
        </Form>
    )
}
export default RegisterForm;