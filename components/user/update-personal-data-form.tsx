//components/user/update-personal-data-form.tsx
"use client"

import { UpdateUserPersonalDataSchema } from "@/schema/user"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUser, useSession } from "@/auth/auth-client"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"
import { useEffect } from "react"
import { Textarea } from "../ui/textarea"

const UpdatePersonalDataForm = () => {
    const { data: session } = useSession()
    
    const form = useForm<z.infer<typeof UpdateUserPersonalDataSchema>>({
        resolver: zodResolver(UpdateUserPersonalDataSchema),
        mode: "all",
        defaultValues: {
            name: session?.user.name ?? "",
            title: session?.user.title ?? "",
            description: session?.user.description ?? ""
        }
    })

    useEffect(() => {
        if (session?.user) {
            form.reset({
                name: session.user.name ?? "",
                title: session.user.title ?? "",
                description: session?.user.description ?? ""
            })
        }
    }, [session?.user, form])


    const { handleSubmit, formState: { isDirty, isValid, isSubmitting }} = form

    const onSubmit: SubmitHandler<z.infer<typeof UpdateUserPersonalDataSchema>> = async (data) => {
        console.log(session?.user)
        await updateUser({
            name: data.name,
            title: data.title
        }, {
            onSuccess: () => { toast.success("Dane zostały zmienione pomyślnie") },
            onError: () => { toast.error("Wystąpił błąd podczas zmiany danych") }
            
        })
    }

    return <Form
        schema={UpdateUserPersonalDataSchema}
        form={form}
    >
        <form className="space-y-4 max-w-s" onSubmit={handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Imię i Nazwisko</FormLabel>
                        <FormControl>
                            <Input {...field}
                                placeholder="Jack Sparrow"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="title"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Tytuł</FormLabel>
                        <FormControl>
                            <Input {...field}
                                placeholder="Kapitan"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Opis</FormLabel>
                        <FormControl>
                            <Textarea {...field}
                                placeholder="Opisz siebie – załogę, statek i największy łup, którym możesz się pochwalić."
                                disabled={isSubmitting}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <Button
                type="submit"
                disabled={!isValid || !isDirty || isSubmitting}
                className="w-full"
                size="lg"
            >
                {isSubmitting ?
                    <div className="flex items-center">
                        <Spinner className="mr-2"/>Przetwarzanie...
                    </div>
                    :
                    <div>
                        Zmień dane
                    </div>
                }
            </Button>
        </form>

    </Form>
}
export default UpdatePersonalDataForm