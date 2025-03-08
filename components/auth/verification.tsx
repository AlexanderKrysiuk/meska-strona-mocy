"use client"

import { SetNewPassword } from "@/actions/auth"
import { NewPasswordSchema } from "@/schema/user"
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Card, CardBody, CardHeader, Form, Input, Link, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { VerificationToken } from "@prisma/client"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

export const TokenNotFound = () => {
    return (
        <main className="absolute inset-0 flex items-center justify-center">
            <Alert
                color="danger"
                variant="bordered"
                title="Nie znaleziono tokenu"
                description="Upewnij się, że link jest poprawny."
                className="m-4 max-w-xs"
            />
        </main>
    )
}

export const TokenExpired = () => {
    return (
        <main className="absolute inset-0 flex items-center justify-center">
            <Alert
                color="danger"
                variant="bordered"
                title="Token stracił ważność"
                description="Wysłano nowy link weryfikacyjny"
                className="m-4 max-w-xs"
            />
        </main>
    )
}

type FormFields = z.infer<typeof NewPasswordSchema>

export const NewPasswordCard = (token: VerificationToken) => {
    const [visible, setVisible] = useState(false)
    const [verificationComplete, setVerificationComplete] = useState(false)
    const toggleVisibility = () => setVisible(!visible)

    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(NewPasswordSchema)
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        try {
            await SetNewPassword(data, token)
            addToast({
                title: "Utworzono nowe hasło",
                description: "Możesz już korzystać z konta",
                color: "success",
                variant: "bordered"
            })
            setVerificationComplete(true)
        } catch (error) {
            setError("root", {message: error instanceof Error ? error.message : "Wystąpił nieznany błąd"})
        }
    }

    return (
        <main className="absolute inset-0 flex items-center justify-center">
            <Card className="m-4 w-full max-w-xs">
                <CardHeader className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faLock} className="mr-2 text-xl text-primary"/>
                    <h2 className="text-lg font-semibold">Werifikacja</h2>
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleSubmit(submit)}>
                        <Input 
                            label="Email"
                            labelPlacement="outside"
                            value={token.email}
                            variant="bordered"
                            isRequired
                            isDisabled
                        />
                        <Input {...register("newPassword")}
                            label="Nowe hasło"
                            labelPlacement="outside"
                            variant="bordered"
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
                            type={visible ? "text" : "password"}
                            placeholder="********"
                            autoComplete="new-password"
                            isRequired
                            isInvalid={!!errors.newPassword || !!errors.root}
                            errorMessage={errors.newPassword?.message}
                        />
                        <Input {...register("confirmPassword")}
                            label="Potwierdź nowe hasło"
                            labelPlacement="outside"
                            variant="bordered"
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
                            type={visible ? "text" : "password"}
                            placeholder="********"
                            autoComplete="new-password"
                            isRequired
                            isInvalid={!!errors.confirmPassword || !!errors.root}
                            errorMessage={errors.confirmPassword?.message}
                        />
                        {errors.root && 
                            <Alert
                                color="danger"
                                title={errors.root.message}
                                variant="bordered"
                            />
                        }
                        {verificationComplete && 
                            <Alert
                                color="success"
                                title="Weryfikacja kompletna!"
                                description="Możesz już w pełni korzystać z konta"
                                variant="bordered"
                            />
                        }
                        <Button
                            type={verificationComplete ? "button" : "submit"}
                            color="primary"
                            fullWidth
                            isDisabled={isSubmitting || !watch("newPassword") || !watch("confirmPassword")}
                            isLoading={isSubmitting}
                            className="text-white"
                        >
                            {verificationComplete ? (
                                <Link
                                    href="/auth/start"
                                    className="text-white"
                                >
                                    Przejdź do logowania
                                </Link>
                            ) : (
                                isSubmitting ? "Przetwarzanie..." : "Ustaw hasło"
                            )}
                        </Button>
                    </Form>
                </CardBody>
            </Card>
        </main>
    )
}