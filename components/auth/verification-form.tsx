"use client"

import { VerifySchema } from "@/schema/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"
import { PasswordInput } from "./password-input"
import { SetPasswordAction } from "@/actions/user"
import { useState } from "react"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"

const VerificationForm = ({
    email
} : {
    email: string
}) => {
    const [passwordChanged, setPasswordChanged] = useState(false)

    const form = useForm<z.infer<typeof VerifySchema>>({
        resolver: zodResolver(VerifySchema),
        mode: "all",
        defaultValues: {
            email,
            password: "",
            newPassword: ""
        }
    })

    const { handleSubmit, trigger, formState: { isValid, isSubmitting }} = form
    
    const onSubmit: SubmitHandler<z.infer<typeof VerifySchema>> = async (data) => {
        try {
            const parsed = VerifySchema.safeParse(data)

            if (!parsed.success) {
                toast.error("Podano nieprawidłowe dane")
            } else {
                const result = await SetPasswordAction({ values: data })
                
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Ustawiono nowe hasło")
                    setPasswordChanged(true)
                }

            }

        } catch (error) {
            console.error(error)
            toast.error("Wystąpił nieoczekiwany błą∂")
        }
    }

    if (passwordChanged) return (
        <Button
            size="lg"
        >
            <Link href={ROUTES.login}>Przejdź do logowania</Link>
        </Button>
    )

    return <Form
        schema={VerifySchema}
        form={form}
    >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="newPassword"
                render={({field}) => 
                    <FormItem>
                        <FormLabel>Nowe hasło</FormLabel>
                        <FormControl>
                            <PasswordInput
                                {...field}
                                autoComplete="new-password"
                                onChange={(e) => {
                                    field.onChange(e)
                                    trigger("password")
                                }}
                            />
                            {/* <Input {...field}
                                type="password"
                                value={field.value}
                                autoComplete="new-password"
                                onChange={(e) => {
                                    field.onChange(e)
                                    trigger("password")
                                }}
                            /> */}
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="password"
                render={({field}) => 
                    <FormItem>
                        <FormLabel>Powtórz hasło</FormLabel>
                        <FormControl>
                            <PasswordInput
                                {...field}
                                autoComplete="new-password"
                                onChange={(e) => {
                                    field.onChange(e)
                                    trigger("newPassword")
                                }}
                            />
                            {/* <Input {...field}
                                type="password"
                                value={field.value}
                                autoComplete="new-password"
                                onChange={(e) => {
                                    field.onChange(e)
                                    trigger("newPassword")
                                }}
                            /> */}
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                }
            />
            <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full"
                size="lg"
            >
                {isSubmitting && <Spinner/>}
                Ustaw nowe hasło
            </Button>
        </form>
    </Form>
}

export default VerificationForm