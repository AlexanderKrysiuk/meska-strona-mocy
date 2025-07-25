"use client"

import { CreateMeetingSchema } from "@/schema/meeting";
import { combineDateAndTime } from "@/utils/date";
import { liveNameify } from "@/utils/slug";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, DatePicker, DateValue, Divider, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem, TimeInput, TimeInputValue, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, today } from "@internationalized/date";
//import { City, Country, Group, Region } from "@prisma/client";
import { Group } from "@prisma/client";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const CreateMeetingModal = ({
    groups,
    selectedGroup
} : {
    groups: Group[]
    selectedGroup?: Group
}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    //const [groupId, setGroupId] = useState<Set<string>>(new Set(selectedGroup?.id))
    //const [group, setGroup] = useState<Group | undefined>(selectedGroup)

    type FormFields = z.infer<typeof CreateMeetingSchema>

    const [date, setDate] = useState<DateValue | null>()
    const [startHour, setStartHour] = useState<TimeInputValue | null>()
    const [endHour, setEndHour] = useState<TimeInputValue | null>()

    const { register, handleSubmit, setValue, getValues, watch, reset, formState: { isSubmitting, errors } } = useForm<FormFields>({
        resolver: zodResolver(CreateMeetingSchema),
        mode: "all",
    })

    const submit: SubmitHandler<FormFields> = async (data) => {
        console.log(data)
    }

    useEffect(() => {
        if (isOpen && selectedGroup) {
          reset({
            ...getValues(),
            groupId: selectedGroup.id,
            street: selectedGroup.street || undefined,
            cityId: selectedGroup.cityId || undefined,
            price: selectedGroup.price || undefined,
          })
        }
      }, [isOpen, selectedGroup, reset, getValues])
      

    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
                onPress={onOpen}
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
                    <ModalHeader>Nowe spotkanie dla grupy: {selectedGroup?.name}</ModalHeader>
                    <Form onSubmit={handleSubmit(submit)}>
                        <ModalBody className="w-full">
                            <Select {...register("groupId")}
                                label="Grupa"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Załoga Czarnej Perły"
                                isRequired
                                selectedKeys={[watch("groupId")]}
                                onSelectionChange={(keys) => {
                                    const group = groups.find(group => group.id === Array.from(keys)[0])

                                    reset({
                                        ...getValues(),
                                        groupId: group?.id,
                                        street: group?.street ?? undefined,
                                        cityId: group?.cityId ?? undefined,
                                        price: group?.price ?? undefined,
                                    })
                                }}
                                items={groups}
                            >
                                {(group) => <SelectItem key={group.id}>{group.name}</SelectItem>}
                            </Select>
                            <DatePicker
                                label="Data spotkania"
                                labelPlacement="outside"
                                variant="bordered"
                                value={date}
                                minValue={today(getLocalTimeZone()).add({days: 1})}
                                onChange={(date) => {
                                    setDate(date)
                                    if (date && startHour) setValue("startTime", combineDateAndTime(date, startHour), {shouldValidate: true})
                                    if (date && endHour) setValue("endTime", combineDateAndTime(date, endHour), {shouldValidate: true})
                                }}
                                isRequired
                                isDisabled={isSubmitting}
                            />
                            <div className="flex space-x-4">
                                <TimeInput
                                    label="Godzina Rozpoczęcia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={startHour}
                                    onChange={(time) => {
                                        setStartHour(time)
                                        if (date && time) setValue("startTime", combineDateAndTime(date, time), {shouldValidate: true})
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date}
                                    isInvalid={!!errors.startTime}
                                    errorMessage={errors.startTime?.message}
                                />
                                <TimeInput
                                    label="Godzina Zakończenia"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    hourCycle={24}
                                    value={endHour}
                                    onChange={(time) => {
                                        setEndHour(time)
                                        if (date && time) setValue("endTime" , combineDateAndTime(date, time), {shouldValidate: true})
                                    }}
                                    isRequired
                                    isDisabled={isSubmitting || !date || !startHour}
                                    isInvalid={!!errors.endTime}
                                    errorMessage={errors.endTime?.message}
                                />
                            </div>
                            <Input {...register("street", {
                                setValueAs: liveNameify
                            })}
                                label="Adres (ulica, numer"
                                labelPlacement="outside"
                                placeholder="Tortuga 13/7"
                                variant="bordered"
                                type="text"
                                value={watch("street")}
                                isDisabled={isSubmitting}
                                isInvalid={!!errors.street}
                                errorMessage={errors.street?.message}
                            />
                        </ModalBody>
                    </Form>
                    <Divider/>
                    <pre>WATCH: {JSON.stringify(watch(),null,2)}</pre>
                    <Divider/>
                    <ModalBody>
                        <div>SelectedGroup</div>
                        <pre>{JSON.stringify(selectedGroup,null,2)}</pre>
                        <Divider/>
                        <div>Groups</div>
                        <pre>{JSON.stringify(groups,null,2)}</pre>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </main>
    )
}

export default CreateMeetingModal;

// "use client"

// import { CreateMeetingSchema } from "@/schema/meeting";
// import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Button, DatePicker, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, TimeInput, TimeInputValue, addToast, useDisclosure } from "@heroui/react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { City, Country, Group, Region } from "@prisma/client";
// import { useRouter } from "next/navigation";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { z } from 'zod'
// import { DateValue, getLocalTimeZone, today } from "@internationalized/date";
// import { CreateMeeting } from "@/actions/meeting";
// import { useEffect, useState } from "react";
// import { combineDateAndTime } from "@/utils/date";
// import { liveNameify } from "@/utils/slug";
// import { group } from "console";

// const CreateMeetingModal = ({
//     groups,
//     countries,
//     regions,
//     cities,
//     groupToEdit
// } : {
//     groups: Group[]
//     countries: Country[]
//     regions: Region[]
//     cities: City[]
//     groupToEdit?: Group
// }) => {
//     const {isOpen, onOpen, onClose} = useDisclosure()
//     const router = useRouter()

    
//     const city = cities.find(city => city.id === groupToEdit?.cityId)
//     const region = regions.find(region => region.id === city?.regionId)
//     const country = countries.find(country => country.id === region?.countryId)

//     const [groupId, setGroupId] = useState(groupToEdit?.id || undefined)

//     const [cityId, setCityId] = useState(city?.id || "")
//     const [regionId, setRegionId] = useState(region?.id || "")
//     const [countryId, setCountryId] = useState(country?.id || "")
    
//     const [date, setDate] = useState<DateValue | null>()
//     const [startHour, setStartHour] = useState<TimeInputValue | null>()
//     const [endHour, setEndHour] = useState<TimeInputValue | null>()
    
//     type FormFields = z.infer<typeof CreateMeetingSchema>
    
//     const  { register, handleSubmit, watch, reset, setError, setValue, trigger, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
//         resolver: zodResolver(CreateMeetingSchema),
//         mode: "all",
//         defaultValues: {
//             groupId: groupToEdit?.id ?? undefined,
//             street: groupToEdit?.street ?? undefined,
//             cityId: groupToEdit?.cityId ?? undefined,
//             price: groupToEdit?.price ?? undefined,
//         }
//     })
    
//     useEffect(()=>{
//         reset()
//         setDate(null)
//         setStartHour(null)
//         setEndHour(null)
//     }, [isOpen])

//     const submit: SubmitHandler<FormFields> = async (data) => {
//         try {
//             await CreateMeeting(data)
//             addToast({
//                 title: "Utworzono nowe spotkanie",
//                 color: "success",
//                 variant: "bordered"
//             })
//             router.refresh()
//             onClose()
//         } catch(error) {
//             setError("root", {message: error instanceof Error ? error.message : "Wystąpił nieznany błąd"})
//         }
//     }

//     return (
//         <main>
//             <Button
//                 color="primary"
//                 startContent={<FontAwesomeIcon icon={faCalendarPlus}/>}
//                 className="text-white"
//                 onPress={onOpen}
//             >
//                 Utwórz nowe spotkanie
//             </Button>
//             <Modal
//                 isOpen={isOpen}
//                 onClose={onClose}
//                 placement="center"
//             >
//                 <ModalContent>
//                     <ModalHeader>Nowe Spotkanie dla grupy {group.name}</ModalHeader>
//                     <Form onSubmit={handleSubmit(submit)}>
//                         <ModalBody className="w-full">
//                             <Select {...register("groupId")}
//                                 label="Grupa"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 placeholder="Załoga Czarnej Perły"
//                                 selectedKeys={groupId ? [groupId] : []}
//                                 onChange={(event) => {
//                                     setGroupId(event.target.value)
//                                     setValue("groupId", event.target.value, {shouldDirty: true})
//                                 }}
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.groupId}
//                                 errorMessage={errors.groupId?.message}
//                                 items={groups}
//                             >
//                                 {(group) => <SelectItem key={group.id}>{group.name}</SelectItem>}
//                             </Select>
//                             <DatePicker
//                                 label="Data spotkania"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 minValue={today(getLocalTimeZone()).add({days: 1})}
//                                 value={date}
//                                 onChange={setDate}
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.startTime}
//                                 errorMessage={errors.startTime?.message}
//                             />
//                             <div className="flex space-x-4">
//                                 <TimeInput
//                                     label="Godzina Rozpoczęcia"
//                                     labelPlacement="outside"
//                                     variant="bordered"
//                                     hourCycle={24}
//                                     value={startHour}
//                                     onChange={(time) => {
//                                         if (date && time) {
//                                             setStartHour(time)
//                                             setValue("startTime", combineDateAndTime(date, time))
//                                             if (endHour) {
//                                                 trigger("endTime")
//                                             }
//                                         }
//                                     }}
//                                     isRequired
//                                     isDisabled={isSubmitting || !date}
//                                     isInvalid={!!errors.startTime}
//                                     errorMessage={errors.startTime?.message}
//                                 />
//                                 <TimeInput
//                                     label="Godzina Zakończenia"
//                                     labelPlacement="outside"
//                                     variant="bordered"
//                                     hourCycle={24}
//                                     value={endHour}
//                                     onChange={(time) => {
//                                         if (date && startHour && time) {
//                                             setEndHour(time)
//                                             setValue("endTime", combineDateAndTime(date, time), {shouldValidate: true})
//                                         }
//                                     }}    
//                                     isRequired
//                                     isDisabled={isSubmitting || !date || !startHour}
//                                     isInvalid={!!errors.endTime}
//                                     errorMessage={errors.endTime?.message}
//                                 />
//                             </div> 
//                             <Input {...register("street", {
//                                 setValueAs: (value) => {
//                                     if (value == null || value === " " || value === "") return null;
//                                     return liveNameify(value);
//                                 }  
//                             })} 
//                                 label="Adres (ulica, numer domu / lokalu)"
//                                 labelPlacement="outside"
//                                 type="text"
//                                 placeholder="Tortuga 13/7"
//                                 variant="bordered"
//                                 value={watch("street")?.toString() || ""}
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.street}
//                                 errorMessage={errors.street?.message}
//                             />
//                             <Select
//                                 label="Kraj"
//                                 labelPlacement="outside"
//                                 placeholder="Karaiby"
//                                 variant="bordered"
//                                 selectedKeys={[countryId]}
//                                 onChange={(event) => {
//                                     setCountryId(event.target.value)
//                                     setRegionId("")
//                                     setValue("cityId", "", {shouldValidate: true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting}
//                                 items={countries}
//                             >
//                                 {(countries) => <SelectItem key={countries.id}>{countries.name}</SelectItem>}
//                             </Select>
//                             <Select
//                                 label="Województwo"
//                                 labelPlacement="outside"
//                                 placeholder="Archipelag Czarnej Perły"
//                                 variant="bordered"
//                                 selectedKeys={[regionId]}
//                                 onChange={(event) => {
//                                     setRegionId(event.target.value)
//                                     setCityId("")
//                                     setValue("cityId", "", {shouldValidate: true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting || !countryId}
//                                 items={regions.filter(region => region.countryId === countryId)}
//                             >
//                                 {(regions) => <SelectItem>{regions.name}</SelectItem>}
//                             </Select>
//                             <Select {...register("cityId")} 
//                                 label="Miasto"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 placeholder="Isla de Muerta"
//                                 selectedKeys={[cityId]}
//                                 onChange={(event)=>{
//                                     setCityId(event.target.value)
//                                     setValue("cityId", event.target.value || "", {shouldValidate: true})
//                                 }}
//                                 isRequired
//                                 isDisabled={isSubmitting || !countryId || !regionId}
//                                 isInvalid={!!errors.cityId}
//                                 errorMessage={errors.cityId?.message}
//                                 items={cities.filter(city => city.regionId === regionId)}
//                             >
//                                 {(cities) => <SelectItem>{cities.name}</SelectItem>}
//                             </Select>
//                             <Input {...register("price", {valueAsNumber: true})}
//                                 label="Cena spotkania"
//                                 labelPlacement="outside"
//                                 variant="bordered"
//                                 type="number"
//                                 min={0}
//                                 placeholder="150"
//                                 endContent={
//                                     <div className="text-foreground-500 text-sm">
//                                         PLN
//                                     </div>
//                                 }
//                                 isRequired
//                                 isClearable
//                                 isDisabled={isSubmitting}
//                                 isInvalid={!!errors.price}
//                                 errorMessage={errors.price?.message}
//                             />
//                         </ModalBody>
//                         <ModalFooter>
//                             <Button
//                                 type="submit"
//                                 color="primary"
//                                 isLoading={isSubmitting}
//                                 isDisabled={isSubmitting || !isValid}
//                             >
//                                 {isSubmitting ? "Przetwarzanie..." : "Dodaj nowe spotkanie"}
//                             </Button>
//                         </ModalFooter>
//                     </Form>
//                 </ModalContent>
//             </Modal>
//         </main>

//     );
// }
 
// export default CreateMeetingModal;