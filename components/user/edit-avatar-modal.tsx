"use client"

import { clientAuth } from "@/hooks/auth";
//import { getCroppedImg } from "@/utils/crop";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Modal, ModalBody, ModalContent, ModalHeader, addToast, useDisclosure } from "@heroui/react";
import React, { useRef, useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper"

const EditAvatarModal = () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MIN_FILE_SIZE = 5 * 1024; // 5KB

    const user = clientAuth()
    const {isOpen, onOpen, onClose} = useDisclosure()


    //const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    const cropperRef = useRef<ReactCropperElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    //const [crop, setCrop] = useState({ x:0, y:0 })
    //const [zoom, setZoom] = useState(1);
    //const containerRef = useRef<HTMLDivElement>(null);
    //const [containerHeight, setContainerHeight] = useState<number>(0);
    
    

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
            
        //setSelectedFile(file)
        setImageUrl(URL.createObjectURL(file))     
        // const img = new Image();
        // img.src = URL.createObjectURL(file);
        // img.onload = () => {
        //     const aspectRatio = img.height / img.width; // wysokość / szerokość
        //     const containerWidth = containerRef.current?.offsetWidth || 0;
        //     setContainerHeight(containerWidth * aspectRatio);
        // };
        onOpen()
    }

    // const handleSave = async () => {
    //     if (!selectedFile) return;
      
    //     try {
    //         const croppedBlob = await getCroppedImg(
    //             URL.createObjectURL(selectedFile),
    //             crop,
    //             zoom,
    //             1
    //         );
      
    //         // 🔄 konwersja Blob -> File
    //         const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      
    //         const formData = new FormData();
    //         formData.append("file", file);
      
    //         // 🚀 wywołanie server action
    //         //const data = await uploadAvatar(formData);
      
      
    //         onClose();
    //     } catch (err) {
    //         console.error(err);
    //         alert("Błąd podczas zapisywania pliku");
    //     }
    //   };

    return <main className="flex justify-center lg:justify-start items-center w-full">
        <div className="relative w-40 h-40 group" onClick={handleAvatarClick}>
            <Avatar
                src={user!.image!}
                showFallback
                className="w-40 h-40"
            />
            {/* Overlay ze strzałką */}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                <FontAwesomeIcon icon={faArrowUp} className="text-white text-xl"/>
                <div>Zmień zdjęcie</div>
            </div>
        </div>
        {/* <Avatar
            src={user?.image!}
            showFallback
            className="w-40 h-40"
            
        /> */}
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
                    {/* <div 
                        ref={containerRef}
                        className="relative h-full bg-transparent"
                        style={{ height: containerHeight }}
                    > */}
                        {imageUrl && (
                            <Cropper
                                src={imageUrl}
                                style={{ height: 400, width: "100%"}}
                                aspectRatio={1}
                                guides={true}
                                viewMode={1}
                                background={false}
                                responsive={true}
                                autoCropArea={1}
                                checkOrientation={false}
                                ref={cropperRef}
                                
                            />
                        )}
                    {/* </div> */}
                </ModalBody>
            </ModalContent>
        </Modal>
    </main>
}
 
export default EditAvatarModal;