'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ResultDownload } from '@/components/tools/ResultDownload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link2, Link2Off } from 'lucide-react'

export function ImageResizeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [keepRatio, setKeepRatio] = useState(true)
  const [originalRatio, setOriginalRatio] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{ blob: Blob; filename: string; originalSize: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (newFiles: File[]) => {
    setFiles([...files, ...newFiles])
    setError(null)
    // 读取第一个图片的尺寸
    if (newFiles.length > 0) {
      const img = new Image()
      const url = URL.createObjectURL(newFiles[0])
      img.onload = () => {
        setWidth(img.width)
        setHeight(img.height)
        setOriginalRatio(img.width / img.height)
        URL.revokeObjectURL(url)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (keepRatio) {
      setHeight(Math.round(newWidth / originalRatio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (keepRatio) {
      setWidth(Math.round(newHeight * originalRatio))
    }
  }

  const handleProcess = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setResults([])
    setError(null)

    const newResults: typeof results = []
    let hasError = false

    for (const file of files) {
      try {
        const blob = await resizeImage(file, width, height)
        newResults.push({
          blob,
          filename: file.name.replace(/\.([^.]+)$/, `_${width}x${height}.$1`),
          originalSize: file.size,
        })
      } catch (error) {
        console.error('Resize failed:', error)
        hasError = true
      }
    }

    if (hasError && newResults.length === 0) {
      setError('图片调整大小失败，请检查文件是否有效')
    }
    
    setResults(newResults)
    setProcessing(false)
  }

  const resizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        URL.revokeObjectURL(url)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          file.type,
          0.92
        )
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }
      img.src = url
    })
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.jpg', '.jpeg', '.png', '.webp']}
        maxSize={20 * 1024 * 1024}
        multiple
        files={files}
        onFilesSelected={handleFileSelect}
        onRemoveFile={(index) => setFiles(files.filter((_, i) => i !== index))}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && results.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">宽度 (px)</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                min={1}
                max={10000}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setKeepRatio(!keepRatio)}
              className={keepRatio ? 'text-blue-600' : 'text-gray-400'}
            >
              {keepRatio ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">高度 (px)</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                min={1}
                max={10000}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { w: 1920, h: 1080, label: '1080p' },
              { w: 1280, h: 720, label: '720p' },
              { w: 800, h: 600, label: '800×600' },
              { w: 640, h: 480, label: '640×480' },
            ].map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => { 
                  setWidth(preset.w)
                  setHeight(preset.h)
                  setKeepRatio(false) // 使用预设时关闭比例锁定
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Button onClick={handleProcess} disabled={processing} className="w-full">
            {processing ? '处理中...' : '调整大小'}
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultDownload
              key={index}
              blob={result.blob}
              filename={result.filename}
              originalSize={result.originalSize}
            />
          ))}
          <Button variant="outline" onClick={handleReset} className="w-full">
            处理更多文件
          </Button>
        </div>
      )}
    </div>
  )
}
