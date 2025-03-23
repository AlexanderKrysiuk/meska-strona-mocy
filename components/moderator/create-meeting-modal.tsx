"use client"

import { CreateMeetingSchema } from "@/schema/meeting";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, DatePicker, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Group } from "@prisma/client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from 'zod'
import {I18nProvider} from "@react-aria/i18n";
import { getLocalTimeZone, today } from "@internationalized/date";
import { CreateMeeting } from "@/actions/meeting";



const CreateMeetingModal = ({
    group
} : {
    group: Group
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()

    type FormFields = z.infer<typeof CreateMeetingSchema>
    
    const  { register, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema),
        defaultValues: {
            id: group.id,
            startTime: new Date()
        }
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        try {
            await CreateMeeting(data)
            addToast({
                title: "Utworzono nowe spotkanie",
                color: "success",
                variant: "bordered"
            })
            router.refresh()
            onClose()
        } catch(error) {
            setError("root", {message: error instanceof Error ? error.message : "Wystąpił nieznany błąd"})
        }
    }

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
                className="text-white"
                onPress={onOpen}
            >
                Utwórz nowe spotkanie
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
            >
                <ModalContent>
                    <ModalHeader>Nowe Spotkanie dla grupy {group.name}</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <input type="hidden" {...register("id")}/>
                            {/*}
                            <Select
                                label="Grupa"
                                labelPlacement="outside"
                                placeholder="Wybierz grupę"
                                variant="bordered"
                                items={Array.isArray(groups) ? groups : [groups]}
                                isDisabled={!Array.isArray(groups) || groups.length === 1}
                                value={groups.length === 1 ? groups[0].id : undefined}  // Jeśli tylko jedna grupa, ustawiamy id jako wartość
                            >
                                {(group) => <SelectItem>{group.name}</SelectItem>}
                            </Select>
                            */}
                            <I18nProvider locale="pl-PL">
                                <DatePicker
                                    label="Data rozpoczęcia spotkania"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    granularity="minute"
                                    minValue={today(getLocalTimeZone()).add({days: 1})}
                                    isRequired
                                    isDisabled={isSubmitting}
                                    isInvalid={!!errors.startTime || !!errors.root}
                                    errorMessage={errors.startTime?.message}
                                    onChange={(date) => {
                                        if (date) setValue("startTime", date.toDate("Europe/Warsaw"));
                                    }}
                                />
                            </I18nProvider>
                            <Input {...register("street")} 
                                label="Adres"
                                labelPlacement="outside"
                                variant="bordered"
                                type="text"
                                isRequired
                                isClearable
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.street || !!errors.root}
                                errorMessage={errors.street?.message}
                            />
                            <Select {...register("city")} 
                                label="Miasto"
                                labelPlacement="outside"
                                variant="bordered"
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.city || !!errors.root}
                                errorMessage={errors.city?.message}
                            >
                                <SelectItem key="Gdańsk">Gdańsk</SelectItem>
                            </Select>
                            <Input  {...register("price")}
                                label="Cena spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                type="number"
                                isRequired
                                isClearable
                                isDisabled={isSubmitting}
                                min={0}
                                isInvalid={!!errors.price || !!errors.root}
                                errorMessage={errors.price?.message}
                            />
                            {errors.root && <Alert
                                color="danger"
                                variant="bordered"
                                title={errors.root.message}
                            />}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={isSubmitting || !watch("startTime") || !watch("street") || !watch("city") || !watch("price")}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Dodaj nowe spotkanie"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>

    );
}
 
export default CreateMeetingModal;