'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, ArrowUp, ArrowDown } from 'lucide-react'

type Direction = 'horizontal' | 'vertical'

export function ImageMergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [direction, setDirection] = useState<Direction>('horizontal')
  const [gap, setGap] = useState(0)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<Blob | null>(null)
  const [resultSize, setResultSize] = useState({ width: 0, height: 0 })
  const [error, setError] = useState<string | null>(null)

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
      img.src = url
    })
  }

  const moveFile = (index: number, dir: 'up' | 'down') => {
    const newFiles = [...files]
    const newIndex = dir === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= files.length) return
    ;[newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
    setFiles(newFiles)
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setProcessing(true)
    setError(null)

    try {
      const images = await Promise.all(files.map(loadImage))
      let totalWidth = 0, totalHeight = 0, maxWidth = 0, maxHeight = 0

      images.forEach(img => {
        maxWidth = Math.max(maxWidth, img.width)
        maxHeight = Math.max(maxHeight, img.height)
        totalWidth += img.width
        totalHeight += img.height
      })

      const canvas = document.createElement('canvas')
      if (direction === 'horizontal') {
        canvas.width = totalWidth + gap * (images.length - 1)
        canvas.height = maxHeight
      } else {
        canvas.width = maxWidth
        canvas.height = totalHeight + gap * (images.length - 1)
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas error')

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let offset = 0
      images.forEach(img => {
        if (direction === 'horizontal') {
          ctx.drawImage(img, offset, (maxHeight - img.height) / 2)
          offset += img.width + gap
        } else {
          ctx.drawImage(img, (maxWidth - img.width) / 2, offset)
          offset += img.height + gap
        }
      })

      setResultSize({ width: canvas.width, height: canvas.height })
      canvas.toBlob(blob => { if (blob) setResult(blob) }, 'image/png')
    } catch {
      setError('图片拼接失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged_image.png'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null) }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.jpg', '.jpeg', '.png', '.webp']}
        maxSize={20 * 1024 * 1024}
        multiple
        files={files}
        onFilesSelected={f => { setFiles([...files, ...f]); setError(null) }}
        onRemoveFile={i => setFiles(files.filter((_, idx) => idx !== i))}
      />

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {files.length >= 2 && !result && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium mb-2">调整顺序（拖拽或使用箭头）</p>
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => moveFile(i, 'up')}><ArrowUp className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" disabled={i === files.length - 1} onClick={() => moveFile(i, 'down')}><ArrowDown className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">拼接方向</label>
            <div className="flex gap-2">
              <button onClick={() => setDirection('horizontal')} className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium ${direction === 'horizontal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                横向拼接
              </button>
              <button onClick={() => setDirection('vertical')} className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium ${direction === 'vertical' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                纵向拼接
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">间距 (px)</label>
              <Input type="number" value={gap} onChange={e => setGap(Math.max(0, Number(e.target.value)))} min={0} max={100} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">背景色</label>
              <div className="flex gap-2">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>

          <Button onClick={handleMerge} disabled={processing} className="w-full">
            {processing ? '拼接中...' : '开始拼接'}
          </Button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-2">拼接完成！</p>
            <p className="text-sm text-green-600 mb-4">尺寸: {resultSize.width} × {resultSize.height} px</p>
            <Button onClick={handleDownload}><Download className="w-4 h-4 mr-2" />下载图片</Button>
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">处理更多图片</Button>
        </div>
      )}
    </div>
  )
}
