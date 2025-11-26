"use client"

import { RegisterSchema } from "@/schema/user"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Chip, Divider, Form, Input, Link, Select, SelectItem, SelectedItems, User, addToast } from "@heroui/react";
import { RegisterNewUser } from "@/actions/user";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { countryToFlag } from "@/utils/flag";
import { useState } from "react";

type FormFields = z.infer<typeof RegisterSchema>

const RegisterForm = () => {
    
    const { handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        resolver: zodResolver(RegisterSchema)
    })
    
    const countries = getCountries().map(code => ({
        code,
        prefix: '+' + getCountryCallingCode(code),
        flag: countryToFlag(code)
    }));

    const userLocale = typeof window !== "undefined" ? navigator.language : "en-US";
    const userCountryCode = userLocale.split("-")[1]?.toUpperCase();
    
    const defaultCountry =
        countries.find(c => c.code === userCountryCode) ?? countries[0];
    
    if (!watch("phone")) {
        setValue("phone", `${defaultCountry.prefix} `, { shouldValidate: false });
    }    
        
    const submit: SubmitHandler<FormFields> = async(data) => {
        const result = await RegisterNewUser(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            {/* <pre>
                {JSON.stringify(watch(),null,2)}<br/>
                Valid: {JSON.stringify(isValid,null,2)}
            </pre>
            <Divider/> */}
            <Input
                label="Imię i nazwisko"
                labelPlacement="outside"
                type="text"
                size="lg"
                autoComplete="name"
                value={watch("name")}
                onValueChange={(value) => setValue("name", value, {shouldValidate: true})}
                placeholder="Jack Sparrow"
                variant="bordered"
                isClearable
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
            />
            <Input
                label="Email"
                labelPlacement="outside"
                type="email"
                size="lg"
                autoComplete="email"
                value={watch("email")}
                onValueChange={(value) => setValue("email", value, {shouldValidate: true})}
                placeholder="jack.sparrow@piratebay.co.uk"
                variant="bordered"
                isClearable
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
            />

            
            {/* <Select
                items={countries}
                variant="bordered"
                selectedKeys={[watch("phone")]}
                onSelectionChange={(keys) => {
                    const code = Array.from(keys)[0] as string;
                    const selected = countries.find(c => c.code === code);
                    if (selected) {
                        setValue("phone", `${selected.prefix} `, { shouldValidate: true });
                    }
                }}
            >
                {(country) => <SelectItem key={country.code}>{country.flag} {country.code} {country.prefix}</SelectItem>}
            </Select> */}
           
            <Input
                fullWidth
                label="Telefon"
                labelPlacement="outside"
                type="tel"
                autoComplete="tel"
                size="lg"
                value={watch("phone") ?? ""}
                onValueChange={(value) => setValue("phone", value, {shouldValidate: true})}
                placeholder="600 700 800"
                variant="bordered"
                startContent={
                    <Select
                        className="w-20"
                        classNames={{
                            value: "text-2xl",
                            //value: "w-8 border-red-500 border-4",
                            //trigger: "w-16", 
                            //trigger: "inline-flex items-center gap-0 p-0 min-w-0", // szerokość zależna od zawartości

                            popoverContent: "min-w-40",                        
                            listbox: "p-0", // usuwa padding z listboxa
                        }}
                        items={countries}
                        defaultSelectedKeys={[defaultCountry.code]}
                        variant="underlined"
                        //selectedKeys={[selectedCountry.flag]}
                        renderValue={(items: SelectedItems<typeof countries[number]>) => {
                            return <div>
                                  {items.map((item) => (
                                    <span key={item.key} >{item.data?.flag}</span>
                                  ))}
                            </div>
                            
                            const country = countries.find(c => c.code === items[0].key);
                            return <span className="text-xl">{country?.flag} </span>;
                          }}
                        onSelectionChange={(keys) => {
                            const code = Array.from(keys)[0] as string;
                            const selected = countries.find(c => c.code === code);
                            if (selected) {
                                setValue("phone", `${selected.prefix} `, { shouldValidate: true });
                            }

                        }}
                    >
                        {(country) => <SelectItem key={country.code}>
                            {country.flag} {country.code} {country.prefix}
                        </SelectItem>}
                    </Select>
                }
                isClearable
                isRequired
                isDisabled={isSubmitting}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone?.message}
            />
            <Button
                type="submit"
                color="primary"
                fullWidth
                isDisabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
            >
                {isSubmitting ? "Przetwarzanie..." : "Załóż konto"}
            </Button>
            <div>
                {`Zakładając konto, akceptujesz wszystkie `} 
                <Link
                    href="/regulaminy"
                    className="inline"
                >
                    regulaminy.
                </Link>
            </div>
        </Form>
    )
}
export default RegisterForm;