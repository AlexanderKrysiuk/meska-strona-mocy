"use client"

import { CreateMeeting } from "@/actions/meeting"
import { CreateMeetingSchema } from "@/schema/meeting"
import { combineDateAndTime } from "@/utils/date"
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, DatePicker, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getLocalTimeZone, parseDate, today } from "@internationalized/date"
import { Circle, CircleMeeting, City, Country, Region } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const CreateMeetingModal = ({
    circles,
    circleId,
    meetings,
    countries,
    regions,
    cities,
} : {
    circles: Circle[]
    circleId?: string
    meetings: CircleMeeting[]
    countries: Country[]
    regions: Region[]
    cities: City[]
}) => {
    const router = useRouter()

    const {isOpen, onOpen, onClose} = useDisclosure()

    const [circleName, setCircleName] = useState<string | undefined>()

    const [date, setDate] = useState<DateValue | null>()
    const [startHour, setStartHour] = useState<TimeInputValue | null>()
    const [endHour, setEndHour] = useState<TimeInputValue | null>()

    const [regionId, setRegionId] = useState<string | null>()
    const [countryId, setCountryId] = useState<string | null>()

    type FormFields = z.infer<typeof CreateMeetingSchema>

    const { register, handleSubmit, trigger, watch, setError, setValue, resetField, formState: { errors,isValid, isSubmitting } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema),
        mode: "all",
    })

    const resetDates = () => {
        resetField("startTime")
        resetField("endTime")
        setDate(null)
        setStartHour(null)
        setEndHour(null)
    }

    const setMeetingData = (circleId: string | undefined) => {
        const circle = circles.find(c => c.id === circleId)
        setCircleName(circle?.name)
        
        if (circle?.id) {
            setValue("circleId", circle.id, {shouldValidate: true})
        } else {
            resetField("circleId")
        }
    
        if (circle?.street) {
            setValue("street", circle.street, {shouldValidate: true})
        } else {
            resetField("street")
        }        
        
        if (circle?.price) {
            setValue("price", circle.price, {shouldValidate: true})
        } else {
            resetField("price")

        }      
        
        if (circle?.cityId) {
            setValue("cityId", circle.cityId, {shouldValidate: true})
        } else {
            resetField("cityId")
        }

        const city = cities.find(c => c.id === circle?.cityId)
        const region = regions.find(r => r.id === city?.regionId)
        const country = countries.find(c => c.id === region?.countryId)

        setCountryId(country?.id)
        setRegionId(region?.id)
    }

    const disabledDates = useMemo(() => 
        meetings.map(meeting => {
            const d = new Date(meeting.startTime)
            return parseDate(d.toISOString().split("T")[0])
    }),[meetings])
      
    const isDateUnavailable = useCallback((date: DateValue) => {
        return disabledDates.some(disabled => date.compare(disabled) === 0)
    }, [disabledDates])
      
    const submit: SubmitHandler<FormFields> = async (data) => {
        const result = await CreateMeeting(data)

        addToast({
            title: result.message,
            color: result.success ? "success" : "danger",
            variant: "bordered"
        })

        if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
                setError(field as keyof FormFields, { message: messages.join(", ")})
            })
        } else {
            router.refresh()
            onClose()
        }
    }

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
                onPress={()=>{
                    setMeetingData(circleId)
                    resetDates()
                    onOpen()
                }}
                isDisabled={circles.length < 1}
            >
                Utwórz nowe spotkanie
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="outside"
            >
                <ModalContent>
                    
                    <ModalHeader>Nowe spotkanie kręgu: {circleName}</ModalHeader>
                    {/*
                    {JSON.stringify(circles,null,2)}
                    <Divider/>
                    {JSON.stringify(watch(),null,2)}<br/>
                    Valid: {JSON.stringify(isValid,null,2)}
                    <Divider/>
                    */}
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <Select {...register("circleId")}
                                hideEmptyContent
                                disallowEmptySelection
                                label="Krąg"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Załoga Czarnej Perły"
                                selectedKeys={[watch("circleId")]}
                                onSelectionChange={(keys)=>{
                                    //setValue("circleId", Array.from(keys)[0].toString(), {shouldValidate: true})
                                    setMeetingData(Array.from(keys)[0].toString())
                                }}
                                isRequired
                                items={circles}
                            >
                                {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
                            </Select>
                            <DatePicker
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                value={date}
                                minValue={today(getLocalTimeZone()).add({days: 1})}
                                isDateUnavailable={isDateUnavailable}
                                onChange={(date) => {
                                    setDate(date)
                                    if (date && startHour) setValue("startTime", combineDateAndTime(date, startHour), {shouldValidate: true})
                                    if (date && endHour) setValue("endTime", combineDateAndTime(date, endHour), {shouldValidate: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.startTime}
                                errorMessage={errors.startTime?.message}
                            />
                            <div className="flex space-x-4">
                                <TimeInput {...register("startTime", {valueAsDate: true})}
                                    label="Godzina rozpoczęczia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={startHour}
                                    onChange={(time) => {
                                        setStartHour(time)
                                        if (date && time) {
                                            setValue("startTime", combineDateAndTime(date, time), {shouldValidate: true})
                                            if (endHour) trigger("endTime")
                                        }
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date}
                                />
                                <TimeInput {...register("endTime", {valueAsDate: true})}
                                    label="Godzina zakończenia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={endHour}
                                    onChange={(time) => {
                                        setEndHour(time)
                                        if (date && time) setValue("endTime", combineDateAndTime(date, time), {shouldValidate: true}) 
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date || !startHour}
                                    isInvalid={!!errors.endTime}
                                    errorMessage={errors.endTime?.message}
                                />
                            </div>
                            <Select
                                label="Kraj"
                                labelPlacement="outside"
                                placeholder="Karaiby"
                                variant="bordered"
                                hideEmptyContent
                                disallowEmptySelection
                                selectedKeys={[countryId!]}
                                onSelectionChange={(keys) => {
                                    setCountryId(Array.from(keys)[0].toString())
                                    setRegionId(null)
                                    resetField("cityId")
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                                items={countries}
                            >
                                {(country) => <SelectItem key={country.id}>{country.name}</SelectItem>}
                            </Select>
                            <Select
                                label="Województwo"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Archipelag Czarnej Perły"
                                hideEmptyContent
                                disallowEmptySelection
                                selectedKeys={[regionId!]}
                                onSelectionChange={(keys) => {
                                    setRegionId(Array.from(keys)[0].toString())
                                    resetField("cityId")
                                }}
                                isRequired
                                isDisabled={isSubmitting || !countryId}
                                items={regions.filter(region => region.countryId === countryId)}
                            >
                                {(region) => <SelectItem key={region.id}>{region.name}</SelectItem>}
                            </Select>
                            <Select {...register("cityId")}
                                label="Miasto"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Isla de Muerta"
                                hideEmptyContent
                                disallowEmptySelection
                                selectedKeys={[watch("cityId")]}
                                onSelectionChange={(keys) => {
                                    setValue("cityId", Array.from(keys)[0].toString(), {shouldValidate: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting || !countryId || !regionId}
                                items={cities.filter(city => city.regionId === regionId)}
                            >
                                {(city) => <SelectItem key={city.id}>{city.name}</SelectItem>}
                            </Select>
                            <Input {...register("street")}
                                label="Adres (ulica, numer)"
                                labelPlacement="outside"
                                placeholder="Tortuga 13/7"
                                variant="bordered"
                                type="text"
                                value={watch("street") || undefined}
                                onValueChange={(value)=>{setValue("street", value, {shouldValidate: true})}}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.street}
                                errorMessage={errors.street?.message}
                            />
                            <NumberInput {...register("price", {valueAsNumber: true})}
                                label="Cena"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="150"
                                minValue={0}
                                formatOptions={{
                                    style: "currency",
                                    currency: "PLN"
                                }}
                                value={watch("price")}
                                onChange={()=>{}}
                                onValueChange={(value) => {setValue("price", value, {shouldValidate: true})}}
                                isClearable
                                isRequired
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.price}
                                errorMessage={errors.price?.message}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting || !isValid}
                            >
                                {isSubmitting ? "Przetwarzanie..." : "Dodaj nowe spotkanie"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </main>
    )
}
export default CreateMeetingModal