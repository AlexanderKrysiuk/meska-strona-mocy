"use client"

import { Upload, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { updateUser, useSession } from "@/lib/auth-client"
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Cropper, ReactCropperElement } from "react-cropper"
import { UpsertAvatarAction } from "@/actions/blob"
import { Spinner } from "../ui/spinner"
import { useRouter } from "next/navigation"

export const AvatarChangeDialog = () => {
    const MAX_FILE_SIZE = 1 * 1024 * 1024 // 2 MB

    const { data: session } = useSession()
    const router = useRouter()
  
    const inputRef = useRef<HTMLInputElement>(null)
    const cropperRef = useRef<ReactCropperElement>(null)

    const [image, setImage] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)

    const onAvatarClick = () => {
        inputRef.current?.click()
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // ✅ sprawdzanie rozmiaru pliku
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Plik jest za duży. Maksymalnie 1 MB.")
            return
        }

        // ✅ minimalny rozmiar 100x100
        const img = new Image()
        img.onload = () => {
            if (img.width < 100 || img.height < 100) {
                toast.error("Minimalny rozmiar obrazka to 100x100px.")
                return
            }
            const reader = new FileReader()
            reader.onload = () => {
                setImage(reader.result as string)
                setOpen(true)
            }
            reader.readAsDataURL(file)
        }
        img.src = URL.createObjectURL(file)
    }

    const onUpload = async () => {
        if (!cropperRef.current) return
        
        setSubmitting(true)
        const cropper = cropperRef.current.cropper

        cropper.getCroppedCanvas().toBlob(async (blob) => {

            if (!blob) {
                setSubmitting(false)
                return
            }

            try {
                const upload = await UpsertAvatarAction(blob)
                toast.success("Avatar przesłany!")
            
                await updateUser({
                    image: upload.url
                })
                // tu możesz zaktualizować usera w DB z nowym URL
            } catch (err) {
                console.error(err)
                toast.error("Błąd przy wysyłce avatara")
            } finally {
                router.refresh()
                setOpen(false)
                setSubmitting(false)
            }
        },
    "image/jpeg", 
    0.8)
}


    
    return <main>

        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
        />

        <div className="group relative" onClick={onAvatarClick}>   
            <Avatar className="w-[50vw] h-[50vw] max-w-80 max-h-80 cursor-pointer">
                <AvatarImage
                    src={session?.user.image ?? undefined}
                    className="object-cover"
                />
                <AvatarFallback className="flex items-center justify-center">
                    <User className="w-1/2 h-1/2" />
                </AvatarFallback>
            </Avatar>

            {/* Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-sm">
                <Upload className="w-8 h-8 mb-2" />
                <span className="font-medium text-xl">Zmień awatara</span>
                <span className="font-medium"> Max 1 MB</span>
            </div>
        </div>

        <Dialog 
            open={open}
            onOpenChange={(o) => setOpen(o)}    
        >
            <DialogContent>
                <DialogTitle>Przytnij Obraz</DialogTitle>
                {image && <Cropper
                    src={image}
                    aspectRatio={1}
                    guides={true}
                    background={false}
                    viewMode={1}
                    responsive={true}
                    autoCropArea={1}
                    minCropBoxWidth={100}
                    minCropBoxHeight={100}
                    checkOrientation={false}
                    ref={cropperRef}
                    className="max-w-[80vw] max-h-[80vh]"
                />}
                <DialogFooter>
                    <Button
                        size="lg"
                        onClick={onUpload}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ?
                            <div className="flex items-center">
                                <Spinner className="mr-2"/>
                                Wysyłanie...
                            </div>
                            :
                            <div>
                                Wyślij
                            </div>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
    </main>
}