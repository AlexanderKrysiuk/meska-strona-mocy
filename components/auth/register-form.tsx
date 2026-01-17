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
import { RegisterUser } from "@/actions/user"
import { toast } from "sonner"

export const RegisterForm = () => {
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

    const { handleSubmit, formState:{ isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof RegisterSchema>> = async (data) => {
        const results = await RegisterUser({
            values: data
        })
        
        if (results?.error) { 
            toast.error(JSON.stringify(results.error))
        } else {
            toast.success("Wysłano e-mail weryfikacyjny")
            form.reset()
        }

        return
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