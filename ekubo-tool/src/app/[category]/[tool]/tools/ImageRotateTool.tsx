'use client'

import { useState, useEffect } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ResultDownload } from '@/components/tools/ResultDownload'
import { Button } from '@/components/ui/button'
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react'

type Transform = { rotate: number; flipH: boolean; flipV: boolean }

export function ImageRotateTool() {
  const [files, setFiles] = useState<File[]>([])
  const [transform, setTransform] = useState<Transform>({ rotate: 0, flipH: false, flipV: false })
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{ blob: Blob; filename: string; originalSize: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 当 files 变化时更新预览
  useEffect(() => {
    if (files.length > 0) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(files[0]))
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const handleFileSelect = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
    setError(null)
  }

  const applyTransform = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const isRotated90 = transform.rotate === 90 || transform.rotate === 270
        const canvas = document.createElement('canvas')
        canvas.width = isRotated90 ? img.height : img.width
        canvas.height = isRotated90 ? img.width : img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas error')); return }

        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((transform.rotate * Math.PI) / 180)
        ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed')), file.type, 0.92)
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
      img.src = url
    })
  }

  const handleProcess = async () => {
    if (files.length === 0) return
    setProcessing(true)
    setResults([])
    setError(null)

    const newResults: typeof results = []
    for (const file of files) {
      try {
        const blob = await applyTransform(file)
        newResults.push({
          blob,
          filename: file.name.replace(/\.([^.]+)$/, '_transformed.$1'),
          originalSize: file.size,
        })
      } catch {
        setError(`处理 ${file.name} 失败`)
      }
    }
    setResults(newResults)
    setProcessing(false)
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, idx) => idx !== index)
    setFiles(newFiles)
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setError(null)
    setTransform({ rotate: 0, flipH: false, flipV: false })
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const rotateLeft = () => setTransform(t => ({ ...t, rotate: (t.rotate - 90 + 360) % 360 }))
  const rotateRight = () => setTransform(t => ({ ...t, rotate: (t.rotate + 90) % 360 }))
  const flipH = () => setTransform(t => ({ ...t, flipH: !t.flipH }))
  const flipV = () => setTransform(t => ({ ...t, flipV: !t.flipV }))

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.jpg', '.jpeg', '.png', '.webp']}
        maxSize={20 * 1024 * 1024}
        multiple
        files={files}
        onFilesSelected={handleFileSelect}
        onRemoveFile={handleRemoveFile}
      />

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {files.length > 0 && results.length === 0 && (
        <div className="space-y-4">
          {previewUrl && (
            <div className="flex justify-center p-4 bg-gray-100 rounded-xl">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 object-contain transition-transform duration-300"
                style={{
                  transform: `rotate(${transform.rotate}deg) scaleX(${transform.flipH ? -1 : 1}) scaleY(${transform.flipV ? -1 : 1})`,
                }}
              />
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={rotateLeft} title="逆时针旋转 90°">
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={rotateRight} title="顺时针旋转 90°">
              <RotateCw className="w-5 h-5" />
            </Button>
            <Button variant={transform.flipH ? 'default' : 'outline'} onClick={flipH} title="水平翻转">
              <FlipHorizontal className="w-5 h-5" />
            </Button>
            <Button variant={transform.flipV ? 'default' : 'outline'} onClick={flipV} title="垂直翻转">
              <FlipVertical className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            旋转: {transform.rotate}° | 水平翻转: {transform.flipH ? '是' : '否'} | 垂直翻转: {transform.flipV ? '是' : '否'}
          </div>

          <Button onClick={handleProcess} disabled={processing} className="w-full">
            {processing ? '处理中...' : `应用到 ${files.length} 张图片`}
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r, i) => <ResultDownload key={i} blob={r.blob} filename={r.filename} originalSize={r.originalSize} />)}
          <Button variant="outline" onClick={handleReset} className="w-full">处理更多图片</Button>
        </div>
      )}
    </div>
  )
}
