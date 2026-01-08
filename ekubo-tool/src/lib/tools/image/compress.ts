import imageCompression from 'browser-image-compression'

export interface ImageCompressOptions {
  quality: number
  maxSizeMB?: number
}

export async function compressImage(
  file: File,
  options: ImageCompressOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // 使用 quality 作为图像质量参数（0-1）
  const qualityValue = Math.max(0.1, Math.min(1, options.quality / 100))
  const maxSizeMB = options.maxSizeMB || 10
  
  if (maxSizeMB <= 0) {
    throw new Error('最大文件大小必须大于 0')
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    initialQuality: qualityValue,
    alwaysKeepResolution: true, // 保持原始分辨率
    onProgress: (progress) => {
      onProgress?.(progress)
    },
  })

  return compressedFile
}
