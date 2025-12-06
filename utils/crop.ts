export async function getCroppedImg(imageSrc: string, crop: any, zoom: number, aspect: number) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
  
    if (!ctx) throw new Error("Canvas not supported")
  
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight
  
    // wymiary wynikowe
    const cropWidth = naturalWidth / zoom
    const cropHeight = cropWidth / aspect
  
    canvas.width = cropWidth
    canvas.height = cropHeight
  
    ctx.drawImage(
      image,
      (crop.x * naturalWidth) / 100,
      (crop.y * naturalHeight) / 100,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    )
  
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject("Blob creation failed")
        resolve(blob)
      }, "image/jpeg")
    })
  }
  
  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener("load", () => resolve(img))
      img.addEventListener("error", (error) => reject(error))
      img.setAttribute("crossOrigin", "anonymous") // ważne dla Vercel Blob
      img.src = url
    })
  }
  