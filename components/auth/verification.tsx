"use client"

import { SetNewPassword } from "@/actions/auth"
import { NewPasswordSchema } from "@/schema/user"
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Form, Input, Spinner, addToast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { VerificationToken } from "@prisma/client"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import ResetPasswordForm from "./reset-password-form"
import { useRouter } from "next/navigation"

export const TokenNotValid = () => {
    return (
        <main className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-xs">
                <CardHeader>
                    <Alert
                        color="danger"
                        title="Podany token jest nieważny"
                        description="Wypełnij formularz aby otrzymać nowy"
                        className="items-center"
                    />
                </CardHeader>
                <CardBody>
                    <ResetPasswordForm/>
                </CardBody>
            </Card>
        </main>
    )
}

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
    const router = useRouter()

    const [visible, setVisible] = useState(false)
    const [verificationComplete, setVerificationComplete] = useState(false)
    const [counter, setCounter] = useState(20)
    
    const toggleVisibility = () => setVisible(!visible)

    const { handleSubmit, watch, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(NewPasswordSchema)
    })

    useEffect(() => {
        let timer: NodeJS.Timeout;
    
        if (verificationComplete) {
          if (counter > 0) {
            timer = setTimeout(() => setCounter(counter - 1), 1000);
          } else {
            router.push("/auth/start"); // przekierowanie po odliczeniu
          }
        }
    
        return () => clearTimeout(timer);
      }, [verificationComplete, counter, router]);

    const submit: SubmitHandler<FormFields> = async (data) => {
        const result = await SetNewPassword(data, token)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })

        if (result.success) setVerificationComplete(true)
    }

    return (
        <main className="absolute inset-0 flex items-center justify-center">
            {verificationComplete ? (
                <Spinner
                    size="lg"
                    color="success"
                    label="Ustawiono nowe hasło, następuje przekierowanie..."
                />
            ) : (
                <Card className="m-4 w-full max-w-xs">
                    <CardHeader className="flex items-center justify-center">
                        <FontAwesomeIcon icon={faLock} className="mr-2 text-xl text-primary"/>
                        <h2 className="text-lg font-semibold">Nowe hasło</h2>
                    </CardHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <CardBody>
                            <Input 
                                label="Email"
                                labelPlacement="outside"
                                value={token.email}
                                variant="bordered"
                                isRequired
                                isDisabled
                            />
                            <Input 
                                label="Nowe hasło"
                                labelPlacement="outside"
                                variant="bordered"
                                value={watch("newPassword")}
                                onValueChange={(value) => setValue("newPassword", value, {shouldValidate: true})}
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
                                isDisabled={isSubmitting || verificationComplete}
                                isInvalid={!!errors.newPassword}
                                errorMessage={errors.newPassword?.message}
                            />
                            <Input
                                label="Potwierdź nowe hasło"
                                labelPlacement="outside"
                                variant="bordered"
                                value={watch("confirmPassword")}
                                onValueChange={(value) => setValue("confirmPassword", value, {shouldValidate: true})}
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
                                isDisabled={isSubmitting || verificationComplete}
                                isInvalid={!!errors.confirmPassword}
                                errorMessage={errors.confirmPassword?.message}
                            />
                        </CardBody>
                        <CardFooter>
                            <Button
                                type="submit"
                                color="primary"
                                fullWidth
                                isDisabled={isSubmitting || !isValid || verificationComplete}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Ustaw hasło"}   
                            </Button>
                        </CardFooter>
                    </Form>
                </Card>
            )}
        </main>
    )
}