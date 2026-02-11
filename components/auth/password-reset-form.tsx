//components/auth/password-reset-form-tsx
"use client"

import { PasswordResetSchema } from "@/schema/user"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { requestPasswordReset } from "@/auth/auth-client"
import { routes } from "@/lib/routes"
import { toast } from "sonner"

export const PasswordResetForm = () => {
    
    const form = useForm<z.infer<typeof PasswordResetSchema>>({
        resolver: zodResolver(PasswordResetSchema),
        mode: "all",
        defaultValues: {
            email: ""
        }
    })

    const { handleSubmit, formState: { isValid, isSubmitting }} = form
    
    const onSubmit: SubmitHandler<z.infer<typeof PasswordResetSchema>> = async (data) => {
        await requestPasswordReset({
            email: data.email,
            redirectTo: routes.newPassword
        },{
            onError: () => {toast.error("Coś poszło nie tak, prosimy spróbować ponownie")},
            onSuccess: () => {toast.success("Wysłano e-mail weryfikacyjny")}
        })
    }
 
    return <Form
        schema={PasswordResetSchema}
        form={form}
    >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                }
            />
            <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full"
                size="lg"
            >
                {isSubmitting ?
                    <div className="flex items-center">
                        <Spinner className="mr-2"/>Resetowanie...
                    </div>
                    :
                    <div>
                        Resetuj hasło
                    </div>
                }
            </Button>
        </form>
    </Form>
}