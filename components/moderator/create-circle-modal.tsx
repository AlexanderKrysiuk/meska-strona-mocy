"use client"

import { CreateCircle } from "@/actions/circle";
import { CreateCircleSchema } from "@/schema/circle";
//import { finalSlugify, liveSlugify } from "@/utils/slug";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, addToast, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const CreateCircleModal = () => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()
    
    type FormFields = z.infer<typeof CreateCircleSchema>

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateCircleSchema)
    })

    const submit: SubmitHandler<FormFields> = async(data) => {
        try {
            const result = await CreateCircle(data)

            addToast({
                title: result.message,
                color: result.success ? "success" : "danger",
                variant: "bordered"
            })

            if (result.success) {
                router.refresh()
                onClose()
            }
            
        } catch {
            addToast({
                title: "Wystąpił nieznany błąd",
                color: "danger",
                variant: "bordered"
            })
        }
    }

    return ( 
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faUserPlus}/>}
                className="text-white"
                onPress={onOpen}
            >
                Utwórz nowy krąg
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
            >
                <ModalContent>
                    <ModalHeader>Nowa grupa</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <Input {...register("name")}
                                label="Nazwa grupy"
                                labelPlacement="outside"
                                type="text"
                                placeholder="Załoga Czarnej Perły"
                                variant="bordered"
                                isClearable
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.name || !!errors.root}
                                errorMessage={errors.name?.message}
                            />
                            <Input {...register("maxMembers", {valueAsNumber: true})}
                                label="Maksymalna liczba uczestników"
                                labelPlacement="outside"
                                type="number"
                                placeholder="11"
                                variant="bordered"
                                min={1}
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.maxMembers || !!errors.root}
                                errorMessage={errors.maxMembers?.message} 
                            />
                            {/*<Input {...register("slug")}
                                label="Unikalny Odnośnik"
                                labelPlacement="outside"
                                type="text"
                                placeholder="zaloga-czarnej-perly"
                                description="Ten odnośnik będzie częścią adresu URL Twojej grupy (np. meska-strona-mocy.pl/meskie-kregi/nazwa-grupy). Użyj krótkiej, łatwej do zapamiętania nazwy bez polskich znaków. Odnośnik powinien być unikalny."
                                variant="bordered"
                                value={watch("slug")}
                                onValueChange={(value) => setValue("slug", liveSlugify(value))}
                                onBlur={(event) => {setValue("slug", finalSlugify(event.target.value))}}
                                isClearable
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.slug || !!errors.root}
                                errorMessage={errors.slug?.message}
                            />*/}
                            {errors.root && 
                                <Alert
                                    title={errors.root.message}
                                    variant="bordered"
                                    color="danger"
                                />
                            }
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={isSubmitting || !watch("name") || !watch("maxMembers") || Object.keys(errors).length > 0}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Utwórz nowy krąg"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    );
}
export default CreateCircleModal;