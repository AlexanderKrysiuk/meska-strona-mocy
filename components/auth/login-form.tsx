"use client"

import { signIn } from "next-auth/react"
import { LoginSchema } from "@/schema/user"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Form, Input, Link, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type FormFields = z.infer<typeof LoginSchema>

const LoginForm = () => {
    const router = useRouter()
    const [visible, setVisible] = useState(false)
    const toggleVisibility = () => setVisible(!visible)

    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(LoginSchema)
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        try {
            await signIn("credentials", {...data, redirect: false })
            addToast({
                title: "Zalogowano pomyślnie",
                description: "Następuje przekierowanie",
                color: "success",
                variant: "bordered"
            })
            router.refresh()
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
                isRequired
                isClearable
                isDisabled={isSubmitting}
                isInvalid={!!errors.email || !!errors.root}
                errorMessage={errors.email?.message}
            />
            <div className="w-full">
                <Link
                    className="absolute right-4 text-xs"
                    href="/auth/password-reset"
                >
                    Nie pamiętasz hasła?
                </Link>
                <Input {...register("password")}
                    label="Hasło"
                    labelPlacement="outside"
                    type={visible ? "text" : "password"}
                    autoComplete="password"
                    placeholder="********"
                    variant="bordered"
                    isRequired
                    isDisabled={isSubmitting}
                    isInvalid={!!errors.password || !!errors.root}
                    errorMessage={errors.password?.message}
                    endContent={
                        <Button
                            isIconOnly
                            size="sm"
                            radius="full"
                            color="primary"
                            variant="light"
                            className="flex items-center"
                            onPress={toggleVisibility}
                        >
                            <FontAwesomeIcon icon={visible ? faEyeSlash : faEye}/>
                        </Button>
                    }
                />
            </div>
            {errors.root && 
                <Alert
                    color="danger"
                    variant="bordered"
                    title={errors.root.message}
                />
            }
            <Button
                type="submit"
                color="primary"
                fullWidth
                isDisabled={isSubmitting || !watch("email") || !watch("password")}
                isLoading={isSubmitting}
                className="text-white"
            >
                {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </Button>
        </Form>
    )
}
export default LoginForm;