"use client"

import { LoginSchema } from "@/schema/user"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { PasswordInput } from "./password-input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { signIn } from "@/lib/auth-client"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { zodResolver } from "@hookform/resolvers/zod"

const LoginForm = () => {
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        mode: "all",
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const { handleSubmit, formState: { isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof LoginSchema>> = async (data) => {
        await signIn.email({
            email: data.email,
            password: data.password,
            callbackURL: routes.signInRedirect
        })
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
                            <div className="flex justify-between">
                                <FormLabel>Hasło</FormLabel>
                                <Button 
                                    asChild
                                    variant="link"
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Link
                                        href={routes.resetPassword}
                                    >
                                        Nie pamiętasz hasła?
                                    </Link>
                                </Button>
                            </div>
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
                    {isSubmitting ?
                        <div className="flex items-center">
                            <Spinner className="mr-2"/>Logowanie...
                        </div>
                        :
                        <div>
                            Zaloguj się
                        </div>
                    }
                </Button>
            </form>
        </Form>
    )
}
export default LoginForm