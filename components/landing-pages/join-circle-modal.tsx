"use client"

import { GetUserByID } from "@/actions/user";
import { clientAuth } from "@/hooks/auth";
import { RegisterToCircle } from "@/schema/user";
import { UserQueries } from "@/utils/query";
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, SelectedItems, useDisclosure } from "@heroui/react";
import { Circle } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import parsePhoneNumberFromString, { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { countryToFlag } from "@/utils/flag";
import { useEffect } from "react";

const JoinCircleModal = ({
    circle
} : {
    circle: Pick<Circle, "id">
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const auth = clientAuth()

    type FormFields = z.infer<typeof RegisterToCircle>

    const { data: user } = useQuery({
        queryKey: [UserQueries.User, auth?.id],
        queryFn: () => GetUserByID(auth!.id),
        enabled: !!auth?.id
    })

    const { handleSubmit, watch, reset, setValue, formState: { isSubmitting, errors, isValid } } = useForm<FormFields>({
        resolver: zodResolver(RegisterToCircle),
        defaultValues: {
            circleId: circle.id
        }
    })

    useEffect(() => {
        if (user) reset({
                name: user.name ?? "",
                email: user.email,
                phone: user.phone ?? ""
        });
    }, [user, reset]);

    const countries = getCountries().map(code => ({
        code,
        prefix: '+' + getCountryCallingCode(code),
        flag: countryToFlag(code)
    }));

    //const isModerator = user?.moderatedCircles?.some(c => c.id === circle.id)

    //const membership = user?.memberships?.find(m => m.circleId === circle.id)

    //const isActiveMember = membership?.status === MembershipStatus.Active
    //const isCandidate = membership?.status === MembershipStatus.Candidate
    //const isBanned = membership?.status === MembershipStatus.Banned
    
    const phone = "+48500200700"
    //const phoneNumber = parsePhoneNumberFromString(phone)

    //const userLocale = typeof window !== "undefined" ? navigator.language : "en-US";
    //const userCountryCode = userLocale.split("-")[1]?.toUpperCase()

    const browserCountry = typeof navigator !== "undefined" ? navigator.language.split("-")[1]?.toUpperCase() : null
    const defaultCountry = countries.find(c => c.code === parsePhoneNumberFromString(phone)?.country) ?? countries.find(c => c.code === browserCountry)
    useEffect(() => {
        if (!watch("phone") && defaultCountry) {
            setValue("phone", defaultCountry.prefix, { shouldValidate: false });
        }
    }, [defaultCountry, setValue, watch]);
    //if (!watch("phone")) setValue("phone", `${defaultCountry?.prefix}`, {shouldValidate: false})
//    const defaultCountry = countries.find(c => c.code === parsePhoneNumberFromString(phone)?.country)

    //let buttonColor: "primary" | "success" | "danger" | "warning"
    //let text: string
    //let cannotJoin: boolean
    //let text = ""
    //let buttonColor = "default"

    return <main className="w-full">
        <Button
            fullWidth
            //isDisabled={isModerator || isActiveMember || isBanned}
            //isDisabled={cannotJoin}
            className="text-white"
            onPress={onOpen}
        >
        </Button>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
        >
            <ModalContent>
                <ModalHeader>Formularz zapisu</ModalHeader>
                <Form onSubmit={handleSubmit(()=>{})}>
                    <ModalBody className="w-full">
                        <Input
                            label="Imię i Nazwisko"
                            labelPlacement="outside"
                            type="text"
                            autoComplete="name"
                            size="lg"
                            value={watch("name")}
                            onValueChange={(value) => setValue("name", value, {shouldValidate: true})}
                            placeholder="Jack Sparrow"
                            variant="bordered"
                            isClearable
                            isRequired
                            isReadOnly={!!user}
                            isDisabled={isSubmitting || !!user?.name}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        />
                        <Input
                            label="Email"
                            labelPlacement="outside"
                            type="email"
                            autoComplete="email"
                            size="lg"
                            value={watch("email")}
                            onValueChange={(value) => setValue("email", value, {shouldValidate: true})}
                            placeholder="jack.sparrow@piratebay.co.uk"
                            variant="bordered"
                            isClearable
                            isRequired
                            isReadOnly={!!user}
                            isDisabled={isSubmitting || !!user?.email}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                        />
                        
                        <Input
                            fullWidth
                            label="Telefon"
                            labelPlacement="outside"
                            type="tel"
                            autoComplete="tel"
                            size="lg"
                            value={watch("phone") ?? ""}
                            onValueChange={(value) => 
                                setValue("phone", value || "", { shouldValidate: true })
                            }
                            placeholder="+48 600 700 800"
                            description="Numer telefonu jest widoczny tylko dla moderatora kręgu i służy wyłącznie do kontaktu organizacyjnego."
                            variant="bordered"
                            startContent={
                                <Select
                                    className="w-20"
                                    classNames={{
                                        value: "text-2xl",
                                        popoverContent: "min-w-40",
                                        listbox: "p-0"
                                    }}
                                    isDisabled={!!user}
                                    items={countries}
                                    defaultSelectedKeys={defaultCountry ? [defaultCountry.code] : undefined}
                                    variant="underlined"
                                    renderValue={(items: SelectedItems<typeof countries[number]>) => {
                                        return <div>
                                            {items.map((item) => (
                                                <span key={item.key}>{item.data?.flag}</span>
                                            ))}
                                        </div>
                                    }}
                                    onSelectionChange={(keys) => {
                                        const code = Array.from(keys)[0] as string
                                        const selected = countries.find(c => c.code === code);
                                        if (selected) setValue("phone", `${selected.prefix}`, {shouldValidate: true})
                                    }}
                                >
                                    {(country) => <SelectItem key={country.code}>
                                        {country.flag} {country.code} {country.prefix}    
                                    </SelectItem>}
                                </Select>
                            }
                            isClearable
                            isRequired
                            isReadOnly={!!user}
                            isDisabled={isSubmitting || !!user}
                            isInvalid={!!errors.phone}
                            errorMessage={errors.phone?.message}
                        />
                    </ModalBody>
                    <ModalFooter className="w-full">
                        <Button
                            type="submit"
                            color="primary"
                            fullWidth
                            isDisabled={isSubmitting || !isValid}
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? "Przetwarzanie..." : "Zapisz mnie na krąg"}
                        </Button>
                        {/* {JSON.stringify(user,null,2)} */}
                    </ModalFooter>
                    <ModalFooter>
                        {JSON.stringify(watch(),null,2)}<br/>
                        <pre>
                            {JSON.stringify(auth,null,2)}
                        </pre>
                        {/* {JSON.stringify(phoneNumber?.country,null,2)}<br/> */}
                        {/* {JSON.stringify(defaultCountry,null,2)}<br/> */}
                        {/* {JSON.stringify(countries,null,2)}<br/> */}
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    </main>
}
 
export default JoinCircleModal;