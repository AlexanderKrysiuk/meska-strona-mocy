//components/auth/new-password-form.tsx
"use client"

import { NewPasswordSchema } from "@/schema/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { PasswordInput } from "./password-input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { useSearchParams } from "next/navigation"
import { resetPassword } from "@/lib/auth-client"
import { toast } from "sonner"
import { routes } from "@/lib/routes"
import { useState } from "react"
import Link from "next/link"

export const NewPasswordForm = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token") as string

    const [completed, setCompleted] = useState(false)

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        mode: "all",
        defaultValues: {
            newPassword: "",
            password: ""
        }
    })

    const { handleSubmit, trigger, formState: { isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof NewPasswordSchema>> = async (data) => {
        await resetPassword({
            newPassword: data.newPassword,
            token
        }, {
            onError: () => {toast.error("Coś poszło nie tak, prosimy spróbować ponownie")},
            onSuccess: () => {
                toast.success("Hasło zmienione pomyślnie")
                setCompleted(true)
            }
        })
    }

    return <Form
        schema={NewPasswordSchema}
        form={form}    
    >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="newPassword"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Nowe hasło</FormLabel>
                        <FormControl>
                            <PasswordInput {...field}
                                autoComplete="new-password"
                                disabled={isSubmitting || completed}
                                onChange={(e) => {
                                    field.onChange(e)
                                    trigger("password")
                                }}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Potwierdź Hasło</FormLabel>
                        <FormControl>
                            <PasswordInput {...field}
                                autoComplete="new-password"
                                disabled={isSubmitting || completed}
                                onChange={(e) => {
                                    field.onChange(e)
                                    trigger("newPassword")
                                }}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            {completed ?
                <Button
                    asChild
                    className="w-full"
                    size="lg"
                >
                    <Link
                        href={routes.start}
                    >
                        Przejdź do logowania
                    </Link>
                </Button>
                :
                <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full"
                    size="lg"
                >
                    {isSubmitting ?
                        <div className="flex items-center">
                            <Spinner className="mr-2"/> Przetwarzanie...
                        </div>
                        :
                        <div>Zmień hasło</div>
                    }

                </Button>
            }
        </form>
    </Form>
    
}