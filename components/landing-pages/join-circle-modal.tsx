"use client"

import { GetUserByID } from "@/actions/user";
import { clientAuth } from "@/hooks/auth";
import { RegisterToCircle } from "@/schema/user";
import { UserQueries } from "@/utils/query";
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, useDisclosure } from "@heroui/react";
import { Circle } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

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

    const { handleSubmit, watch, setValue, formState: { isSubmitting, errors, isValid } } = useForm<FormFields>({
        resolver: zodResolver(RegisterToCircle),
        defaultValues: {
            //name: user?.name,
            email: user?.email
        }
    })

    const countries = getCountries().map(code => ({
        code,
        prefix: '+' + getCountryCallingCode(code)
    }));

    const isModerator = user?.moderatedCircles?.some(c => c.id === circle.id)
    const isMember = user?.memberships?.some(m => m.id === circle.id)

    let text = ""

    switch(true) {
        case isModerator:
            text = "Jesteś moderatorem tego kręgu"
            break;
        case isMember:
            text = "Jesteś uczestnikiem tego kręgu"
            break;
        default:
            text = "Dołącz do kręgu"
    }

    return <main className="w-full">
        <Button
            fullWidth
            color="warning"
            //isDisabled={isMember || isModerator}
            className="text-white"
            onPress={onOpen}
        >
            {text}
        </Button>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
        >
            <ModalContent>
                <ModalHeader>123</ModalHeader>
                <Form onSubmit={handleSubmit(()=>{})}>
                    <ModalBody className="w-full">
                        {/* <Input
                            label="Imię i Nazwisko"
                            labelPlacement="outside"
                            type="text"
                            autoComplete="name"
                            value={watch("name") ?? ""}
                            onValueChange={(value) => setValue("name", value || null, {shouldValidate: true})}
                            placeholder="Jack Sparrow"
                            variant="bordered"
                            isClearable
                            isDisabled={isSubmitting || !!user?.name}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        /> */}
                        <Input
                            label="Email"
                            labelPlacement="outside"
                            type="email"
                            autoComplete="email"
                            value={watch("email")}
                            onValueChange={(value) => setValue("email", value, {shouldValidate: true})}
                            placeholder="jack.sparrow@piratebay.co.uk"
                            variant="bordered"
                            isClearable
                            isRequired
                            isDisabled={isSubmitting || !!user?.email}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                        />
                        <div className="flex items-center gap-1">
                        <Select
                            //value={selectedPrefix}
                            //onValueChange={setSelectedPrefix}
                            label="Prefix"
                            labelPlacement="outside"
                            placeholder="Wybierz kraj"
                            items={countries}
                            variant="bordered"
                        >
                            {(country) => <SelectItem key={country.code}>{country.prefix}</SelectItem>}
                        </Select>
                        <Input
                            fullWidth
                            label="Telefon"
                            labelPlacement="outside"
                            type="tel"
                            autoComplete="tel"
                            value={watch("phone") ?? ""}
                            onValueChange={(value) => 
                                setValue("phone", value || "", { shouldValidate: true })
                            }
                            placeholder="+48 600 700 800"
                            variant="bordered"
                            isClearable
                            isDisabled={isSubmitting || !!user?.phone}
                            isInvalid={!!errors.phone}
                            errorMessage={errors.phone?.message}
                            />
                        </div>
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
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    </main>
}
 
export default JoinCircleModal;