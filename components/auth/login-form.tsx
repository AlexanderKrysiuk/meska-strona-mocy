"use client"

import { LoginSchema } from "@/schema/user"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { PasswordInput } from "./password-input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"
import { ROUTES } from "@/lib/routes"
import { signInEmail } from "better-auth/api"

const LoginForm = () => {
    const form = useForm<z.infer<typeof LoginSchema>>({
        mode: "all",
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const { handleSubmit, formState: { isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof LoginSchema>> = async (data) => {
        try {
            await signInEmail
            // await signIn("credentials", {
            //     redirect: true,
            //     callbackUrl: ROUTES.kokpit,  // gdzie po zalogowaniu
            //     email: data.email,
            //     password: data.password
            // })
        } catch(error) {
            console.error(error);
            toast.error("Wystąpił nieoczekiwany błą∂")
        }
    }

    return (
        <Form
            schema={LoginSchema}
            form={form}
        >
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    type="email"
                                    autoComplete="email"
                                    disabled={isSubmitting}
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
                            <FormLabel>Hasło</FormLabel>
                            <FormControl>
                                <PasswordInput {...field}
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full"
                    size="lg"
                >
                    {isSubmitting && <Spinner/>}
                    Zaloguj się
                </Button>
            </form>
        </Form>
    )
}
export default LoginForm