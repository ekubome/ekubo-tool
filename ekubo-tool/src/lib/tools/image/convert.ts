export interface ImageConvertOptions {
  format: 'jpeg' | 'png' | 'webp'
  quality?: number
}

export async function convertImage(
  file: File,
  options: ImageConvertOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const mimeType = `image/${options.format}`
      const quality = options.quality ? options.quality / 100 : 0.92

      // 尝试使用 OffscreenCanvas（更快，不阻塞主线程）
      if (typeof OffscreenCanvas !== 'undefined') {
        try {
          const offscreen = new OffscreenCanvas(img.width, img.height)
          const ctx = offscreen.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            offscreen.convertToBlob({ type: mimeType, quality })
              .then(resolve)
              .catch(() => fallbackConvert(img, mimeType, quality, resolve, reject))
            return
          }
        } catch {
          // OffscreenCanvas 不支持，使用普通 Canvas
        }
      }

      fallbackConvert(img, mimeType, quality, resolve, reject)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

function fallbackConvert(
  img: HTMLImageElement,
  mimeType: string,
  quality: number,
  resolve: (blob: Blob) => void,
  reject: (error: Error) => void
) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    reject(new Error('Failed to get canvas context'))
    return
  }

  ctx.drawImage(img, 0, 0)

  canvas.toBlob(
    (blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert image'))
      }
    },
    mimeType,
    quality
  )
}
