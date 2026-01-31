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
import { signUp } from "@/lib/auth-client"
import { PasswordInput } from "./password-input"

export const RegisterForm = () => {
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        mode: "all",
        shouldUnregister: false,
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: ""
        }
    })

    const { handleSubmit, formState:{ isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof RegisterSchema>> = async (data) => {
        await signUp.email({
            email: data.email,
            name: data.name,
            phone: data.phone,
            password: data.password,
        }, {
            onResponse: () => {
                toast.success("Jeśli konto zostało utworzone, wysłaliśmy e-mail weryfikacyjny.")
            }
        })
        
        // try {
        //     console.log("SUCCESS")
        //     const parsed = RegisterSchema.safeParse(data)
        //     if (!parsed.success) {
        //         toast.error("Podano nieprawidłowe dane")
        //     } else {
        //         const results = await RegisterUserAction({values: data})
        //         if (results?.error) { 
        //             //toast.error(JSON.stringify(results.error))
        //             toast.error(results.error)
        //         } else {
        //             toast.success("Wysłano e-mail weryfikacyjny")
        //             form.reset()
        //         }
        //     }
        // } catch (error) {
        //     console.error(error)
        //     toast.error("Wystąpił nieoczekiwany błąd")
        // }
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
                            // onChange={field.onChange}
                            // onBlur={field.onBlur}
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
                            // onChange={field.onChange}
                            // onBlur={field.onBlur}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            }/>
            <FormField
                control={form.control}
                name="password"
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
                name="phone"
                render={({field}) => 
                <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                        <Input {...field}
                            placeholder="+48500600700"
                            autoComplete="tel"
                            disabled={isSubmitting}
                            // onChange={field.onChange}
                            // onBlur={field.onBlur}
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
                
                {isSubmitting && <Spinner/>}
                Zarejestruj się
            </Button>
        </form>
    </Form>
}