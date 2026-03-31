//components/auth/register-form.tsx
"use client"

import { RegisterSchema } from "@/schema/user"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"
import { signUp } from "@/auth/auth-client"
import { PasswordInput } from "./password-input"

export const RegisterForm = () => {
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        mode: "all",
        shouldUnregister: false,
        defaultValues: {
            name: "",
            email: "",
            newPassword: "",
            phoneOptional: ""
        }
    })

    const { handleSubmit, formState:{ isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof RegisterSchema>> = async (data) => {
        console.log("Próba rejestracji")
        toast.error("ERROR")
        // await signUp.email({
        //     email: data.email,
        //     name: data.name,
        //     phone: data.phoneOptional ?? "",
        //     password: data.newPassword,
        // }, {
        //     onResponse: () => {
        //         toast.success("Jeśli konto zostało utworzone, wysłaliśmy e-mail weryfikacyjny.")

        //     }
        // })
        console.log("Próba udana")
    }

    return <Form 
        schema={RegisterSchema}
        form={form}
    >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="name"
                render={({field}) => 
                <FormItem>
                    <FormLabel>Imię i Nazwisko</FormLabel>
                    <FormControl>
                        <Input {...field}
                            placeholder="Jack Sparrow"
                            autoComplete="name"
                            disabled={isSubmitting}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            }/>
            <FormField
                control={form.control}
                name="email"
                render={({field}) => 
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input {...field}
                            placeholder="jack.sparrow@piratebay.co.uk"
                            type="email"
                            autoComplete="email"
                            disabled={isSubmitting}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            }/>
            <FormField
                control={form.control}
                name="newPassword"
                render={({field}) =>
                    <FormItem>
                        <FormLabel>Hasło</FormLabel>
                        <FormControl>
                            <PasswordInput {...field}
                                autoComplete="new-password"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="phoneOptional"
                render={({field}) => 
                <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                        <Input {...field}
                            placeholder="+48500600700"
                            autoComplete="tel"
                            disabled={isSubmitting}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            }/>
            <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full"
                size="lg"
            >
                {isSubmitting ? 
                    <div className="flex items-center">
                        <Spinner className="mr-2"/>Przetwarzanie...
                    </div>
                    :
                    <div>
                        Zarejestruj się
                    </div>
                }
            </Button>
        </form>
    </Form>
}