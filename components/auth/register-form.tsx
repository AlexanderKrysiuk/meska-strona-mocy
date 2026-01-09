//components/auth/register-form.tsx
"use client"

import { RegisterSchema } from "@/schema/user"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"

export function RegisterForm() {
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        mode: "all",
        shouldUnregister: false,
        defaultValues: {
            name: "",
            email: "",
            phone: ""
        }
    })

    const { watch, handleSubmit, formState:{ isValid, isSubmitting }} = form

    function onSubmit(data: z.infer<typeof RegisterSchema>) {
        toast(JSON.stringify(watch(),null,2))
    }

    return <Form {...form}>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="name"
                render={({field}) => 
                <FormItem>
                    <FormLabel>Imię i Nazwisko</FormLabel>
                    <FormControl>
                        <Input {...field}
                            value={field.value}
                            autoComplete="name"
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
                            value={field.value}
                            autoComplete="email"
                            // onChange={field.onChange}
                            // onBlur={field.onBlur}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            }/>
            <FormField
                control={form.control}
                name="phone"
                render={({field}) => 
                <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                        <Input {...field}
                            value={field.value}
                            autoComplete="tel"
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