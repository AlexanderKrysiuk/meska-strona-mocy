"use client"

import { RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Link, addToast } from "@heroui/react";
import { RegisterNewUser } from "@/actions/user";

type FormFields = z.infer<typeof RegisterSchema>

const RegisterForm = () => {
    const { handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(RegisterSchema)
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await RegisterNewUser(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            {/* <pre>
                {JSON.stringify(watch(),null,2)}<br/>
                Valid: {JSON.stringify(isValid,null,2)}
            </pre>
            <Divider/> */}
            <Input
                label="Imię i nazwisko"
                labelPlacement="outside"
                type="text"
                autoComplete="name"
                value={watch("name") ?? undefined}
                onValueChange={(value) => setValue("name", value || null, {shouldValidate: true})}
                placeholder="Jack Sparrow"
                variant="bordered"
                isClearable
                isDisabled={isSubmitting}
                isInvalid={!!errors.name || !!errors.root}
                errorMessage={errors.name?.message}
            />
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
                isInvalid={!!errors.email || !!errors.root}
                errorMessage={errors.email?.message}
            />
            <Button
                type="submit"
                color="primary"
                fullWidth
                isDisabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
            >
                {isSubmitting ? "Przetwarzanie..." : "Załóż konto"}
            </Button>
            <div>
                {`Zakładając konto, akceptujesz wszystkie `} 
                <Link
                    href="/regulaminy"
                    className="inline"
                >
                    regulaminy.
                </Link>
            </div>
        </Form>
    )
}
export default RegisterForm;