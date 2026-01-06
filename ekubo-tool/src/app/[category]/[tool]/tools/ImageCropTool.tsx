'use client'

import { useState, useRef, useEffect } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, RotateCcw } from 'lucide-react'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropTool() {
  const [files, setFiles] = useState<File[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [result, setResult] = useState<Blob | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0])
      setImageUrl(url)
      const img = new Image()
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height })
        const containerWidth = containerRef.current?.clientWidth || 600
        const newScale = Math.min(1, containerWidth / img.width)
        setScale(newScale)
        setCropArea({ x: 0, y: 0, width: img.width * 0.8, height: img.height * 0.8 })
      }
      img.src = url
      return () => URL.revokeObjectURL(url)
    }
  }, [files])

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
    e.preventDefault()
    setIsDragging(true)
    setDragType(type)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragType) return
    const dx = (e.clientX - dragStart.x) / scale
    const dy = (e.clientY - dragStart.y) / scale
    setDragStart({ x: e.clientX, y: e.clientY })

    setCropArea(prev => {
      if (dragType === 'move') {
        return {
          ...prev,
          x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + dx)),
          y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + dy)),
        }
      } else {
        const newWidth = Math.max(50, Math.min(imageSize.width - prev.x, prev.width + dx))
        const newHeight = Math.max(50, Math.min(imageSize.height - prev.y, prev.height + dy))
        return { ...prev, width: newWidth, height: newHeight }
      }
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
  }

  const handleCrop = async () => {
    if (!files[0] || !imageUrl) return
    const canvas = document.createElement('canvas')
    canvas.width = cropArea.width
    canvas.height = cropArea.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height)
      canvas.toBlob(blob => { if (blob) setResult(blob) }, files[0].type, 0.92)
    }
    img.src = imageUrl
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = files[0].name.replace(/\.([^.]+)$/, '_cropped.$1')
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setFiles([])
    setImageUrl(null)
    setResult(null)
    setCropArea({ x: 0, y: 0, width: 100, height: 100 })
  }

  return (
    <div className="space-y-6">
      {!imageUrl ? (
        <FileUploader
          accept={['.jpg', '.jpeg', '.png', '.webp']}
          maxSize={20 * 1024 * 1024}
          files={files}
          onFilesSelected={setFiles}
          onRemoveFile={() => setFiles([])}
        />
      ) : !result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-gray-500">X</label>
              <Input 
                type="number" 
                value={Math.round(cropArea.x)} 
                onChange={e => setCropArea(p => ({ 
                  ...p, 
                  x: Math.max(0, Math.min(imageSize.width - p.width, Number(e.target.value))) 
                }))} 
              />
            </div>
            <div>
              <label className="text-gray-500">Y</label>
              <Input 
                type="number" 
                value={Math.round(cropArea.y)} 
                onChange={e => setCropArea(p => ({ 
                  ...p, 
                  y: Math.max(0, Math.min(imageSize.height - p.height, Number(e.target.value))) 
                }))} 
              />
            </div>
            <div>
              <label className="text-gray-500">宽度</label>
              <Input 
                type="number" 
                value={Math.round(cropArea.width)} 
                onChange={e => setCropArea(p => ({ 
                  ...p, 
                  width: Math.max(50, Math.min(imageSize.width - p.x, Number(e.target.value))) 
                }))} 
              />
            </div>
            <div>
              <label className="text-gray-500">高度</label>
              <Input 
                type="number" 
                value={Math.round(cropArea.height)} 
                onChange={e => setCropArea(p => ({ 
                  ...p, 
                  height: Math.max(50, Math.min(imageSize.height - p.y, Number(e.target.value))) 
                }))} 
              />
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gray-100 rounded-xl overflow-hidden select-none"
            style={{ height: imageSize.height * scale + 40 }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img src={imageUrl} alt="Preview" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} className="pointer-events-none" />
            <div className="absolute inset-0 bg-black/50" style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cropArea.x * scale}px ${cropArea.y * scale}px, ${cropArea.x * scale}px ${(cropArea.y + cropArea.height) * scale}px, ${(cropArea.x + cropArea.width) * scale}px ${(cropArea.y + cropArea.height) * scale}px, ${(cropArea.x + cropArea.width) * scale}px ${cropArea.y * scale}px, ${cropArea.x * scale}px ${cropArea.y * scale}px)` }} />
            <div
              className="absolute border-2 border-white cursor-move"
              style={{ left: cropArea.x * scale, top: cropArea.y * scale, width: cropArea.width * scale, height: cropArea.height * scale }}
              onMouseDown={e => handleMouseDown(e, 'move')}
            >
              <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border-2 border-blue-500 cursor-se-resize" onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, 'resize') }} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCrop} className="flex-1">裁剪图片</Button>
            <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-2">裁剪完成！</p>
            <p className="text-sm text-green-600 mb-4">尺寸: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px</p>
            <Button onClick={handleDownload}><Download className="w-4 h-4 mr-2" />下载图片</Button>
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">处理其他图片</Button>
        </div>
      )}
    </div>
  )
}
