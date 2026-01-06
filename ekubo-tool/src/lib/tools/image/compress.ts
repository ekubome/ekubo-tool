import imageCompression from 'browser-image-compression'

export interface ImageCompressOptions {
  quality: number
}

export async function compressImage(
  file: File,
  options: ImageCompressOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // 使用 quality 作为图像质量参数（0-1），而不是目标文件大小
  const qualityValue = options.quality / 100
  
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 10, // 设置一个合理的最大值
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
