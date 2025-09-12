"use client"

import { clientAuth } from "@/hooks/auth";
import { faArrowUp, faScissors } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalHeader, addToast, useDisclosure } from "@heroui/react";
import React, { useRef, useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper"
import "cropperjs/dist/cropper.css";
import "@/utils/cropper-rounded.css"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryUploadAvatar } from "@/actions/blob";
import { UserQueries } from "@/utils/query";
import { User } from "@prisma/client";


const EditAvatarModal = ({
    user
} : {
    user: Pick<User, "image">
}) => {
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 5MB
    const MIN_FILE_SIZE = 4 * 1024; // 5KB

    const auth = clientAuth()
    const {isOpen, onOpen, onClose} = useDisclosure()

    // const { data: user } = useQuery({
    //     queryKey: [UserQueries.User, auth?.id],
    //     queryFn: () => QueryGetUserByID(auth!.id),
    //     enabled: !!auth?.id
    // })

    const [imageUrl, setImageUrl] = useState<string | null>(null)

    const cropperRef = useRef<ReactCropperElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // 🔍 walidacja rozmiaru
        if (file.size > MAX_FILE_SIZE) {
            addToast({
                title: "Plik jest za duży (max 5MB)",
                color: "danger"
            })
            return
        }
  
        if (file.size < MIN_FILE_SIZE) {
            addToast({
                title: "Plik jest za mały (min 5KB)",
                color: "danger"
            })
            return;
        }
            
        // 🔍 walidacja wymiarów
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            if (img.width < 100 || img.height < 100) {
                addToast({
                    title: "Obrazek musi mieć minimum 100x100 pikseli",
                    color: "danger"
                });
                event.target.value = "";
                return;
            }

            // ✅ dopiero jak przeszedł wszystkie walidacje
            setImageUrl(img.src);
            onOpen();
        };
    
        event.target.value = ""
    }

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (formData: FormData) => QueryUploadAvatar(formData),
        onSuccess: (data) => {
            addToast({
                title: data.message,
                color: "success"
            });
            queryClient.invalidateQueries({ queryKey: [UserQueries.User, auth?.id] });
            onClose();
        },
        onError: (error) => {
            addToast({
                title: error.message,
                color: "danger"
            });
            console.error(error);
        },
    })

    const handleSave = async () => {
        if (!cropperRef.current) return

        const cropper = cropperRef.current.cropper
        
        const canvas = cropper.getCroppedCanvas({
            width: 300,
            height: 300,
        })

        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg")
        })

        const file = new File([blob], "avatar.jpg", {type: "image/jpeg"})

         // FormData do wysyłki
        const formData = new FormData();
        formData.append("file", file);

        // 🚀 mutacja z React Query
        mutation.mutate(formData);
    }

    return <main className="flex justify-center lg:justify-start items-center w-full">
        <div className="relative w-40 h-40 group" onClick={handleAvatarClick}>
            <Avatar
                src={user?.image || undefined}
                showFallback
                className="w-40 h-40"
                
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer text-xl text-white">
                <FontAwesomeIcon icon={faArrowUp}/>
                <strong>Zmień zdjęcie</strong>
            </div>
        </div>
        <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
        />
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            scrollBehavior="outside"
            size="xl"
        >
            <ModalContent>
                <ModalHeader>Edytuj zdjęcie</ModalHeader>
                <ModalBody>                   
                    {imageUrl && (
                        <Cropper
                            src={imageUrl}
                            aspectRatio={1}
                            guides={true}
                            viewMode={1}
                            background={false}
                            responsive={true}
                            autoCropArea={1}
                            minCropBoxWidth={100}
                            minCropBoxHeight={100}
                            checkOrientation={false}
                            ref={cropperRef}
                            className="r"
                        />
                    )}
                    <Button
                        fullWidth
                        color="success"
                        className="text-white"
                        startContent={mutation.isPending ? undefined : <FontAwesomeIcon icon={faScissors}/>}
                        onPress={handleSave}
                        isLoading={mutation.isPending}
                        isDisabled={mutation.isPending || !imageUrl}
                    >
                        {mutation.isPending ? "Przetwarzanie..." : "Wytnij i zapisz"}
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    </main>
}
 
export default EditAvatarModal;