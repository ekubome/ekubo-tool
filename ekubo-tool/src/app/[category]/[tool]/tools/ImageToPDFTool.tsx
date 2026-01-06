'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { PDFDocument } from 'pdf-lib'
import { Download, GripVertical, Image } from 'lucide-react'

const PAGE_SIZES = [
  { value: 'a4', label: 'A4 (210 × 297 mm)', width: 595.28, height: 841.89 },
  { value: 'letter', label: 'Letter (8.5 × 11 in)', width: 612, height: 792 },
  { value: 'a3', label: 'A3 (297 × 420 mm)', width: 841.89, height: 1190.55 },
  { value: 'fit', label: '适应图片大小', width: 0, height: 0 },
]

const ORIENTATION_OPTIONS = [
  { value: 'auto', label: '自动' },
  { value: 'portrait', label: '纵向' },
  { value: 'landscape', label: '横向' },
]

export function ImageToPDFTool() {
  const [files, setFiles] = useState<File[]>([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('auto')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const moveFile = (from: number, to: number) => {
    const newFiles = [...files]
    const [removed] = newFiles.splice(from, 1)
    newFiles.splice(to, 0, removed)
    setFiles(newFiles)
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const pdfDoc = await PDFDocument.create()
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const imageBytes = await file.arrayBuffer()
        
        let image
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes)
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else {
          // 对于 webp 等格式，先转换为 png
          const blob = new Blob([imageBytes], { type: file.type })
          const bitmap = await createImageBitmap(blob)
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(bitmap, 0, 0)
          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png')
          })
          const pngBytes = await pngBlob.arrayBuffer()
          image = await pdfDoc.embedPng(pngBytes)
        }

        const imgWidth = image.width
        const imgHeight = image.height
        const imgRatio = imgWidth / imgHeight

        let pageWidth: number
        let pageHeight: number

        const sizeConfig = PAGE_SIZES.find(s => s.value === pageSize)!
        
        if (pageSize === 'fit') {
          pageWidth = imgWidth
          pageHeight = imgHeight
        } else {
          // 确定页面方向
          let isLandscape = false
          if (orientation === 'landscape') {
            isLandscape = true
          } else if (orientation === 'auto') {
            isLandscape = imgRatio > 1
          }

          if (isLandscape) {
            pageWidth = Math.max(sizeConfig.width, sizeConfig.height)
            pageHeight = Math.min(sizeConfig.width, sizeConfig.height)
          } else {
            pageWidth = Math.min(sizeConfig.width, sizeConfig.height)
            pageHeight = Math.max(sizeConfig.width, sizeConfig.height)
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight])

        // 计算图片在页面中的位置和大小（保持比例，居中）
        let drawWidth = pageWidth
        let drawHeight = pageWidth / imgRatio

        if (drawHeight > pageHeight) {
          drawHeight = pageHeight
          drawWidth = pageHeight * imgRatio
        }

        const x = (pageWidth - drawWidth) / 2
        const y = (pageHeight - drawHeight) / 2

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        })

        setProgress(((i + 1) / files.length) * 100)
      }

      const pdfBytes = await pdfDoc.save()
      setResult(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }))
    } catch (err) {
      console.error('Convert failed:', err)
      setError('转换失败，请检查图片格式')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = 'images.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']}
        maxSize={20 * 1024 * 1024}
        multiple
        files={files}
        onFilesSelected={(newFiles) => { setFiles([...files, ...newFiles]); setResult(null) }}
        onRemoveFile={(index) => setFiles(files.filter((_, i) => i !== index))}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && !result && (
        <div className="space-y-4">
          {/* 图片排序 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">
              <Image className="w-4 h-4 inline mr-1" />
              共 {files.length} 张图片，拖拽调整顺序
            </p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveFile(index, index - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === files.length - 1}
                      onClick={() => moveFile(index, index + 1)}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">页面大小</label>
              <Select
                options={PAGE_SIZES.map(s => ({ value: s.value, label: s.label }))}
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">页面方向</label>
              <Select
                options={ORIENTATION_OPTIONS}
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
              />
            </div>
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleConvert} className="w-full">
              转换为 PDF
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-4">转换完成！共 {files.length} 页</p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              下载 PDF
            </Button>
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">
            处理其他图片
          </Button>
        </div>
      )}
    </div>
  )
}
