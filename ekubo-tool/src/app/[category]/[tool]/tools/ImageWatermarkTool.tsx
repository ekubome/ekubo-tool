'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ResultDownload } from '@/components/tools/ResultDownload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

export function ImageWatermarkTool() {
  const [files, setFiles] = useState<File[]>([])
  const [watermarkText, setWatermarkText] = useState('watermark')
  const [fontSize, setFontSize] = useState(24)
  const [opacity, setOpacity] = useState(50)
  const [color, setColor] = useState('#000000')
  const [position, setPosition] = useState<'center' | 'tile' | 'corner'>('center')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{ blob: Blob; filename: string; originalSize: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const addWatermark = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas error')); return }

        ctx.drawImage(img, 0, 0)
        // 使用系统默认字体，更好地支持中文
        ctx.font = `${fontSize}px "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif`
        ctx.fillStyle = color
        ctx.globalAlpha = opacity / 100

        if (position === 'center') {
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2)
        } else if (position === 'tile') {
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const gap = fontSize * 6
          for (let y = 0; y < canvas.height + gap; y += gap) {
            for (let x = 0; x < canvas.width + gap; x += gap) {
              ctx.save()
              ctx.translate(x, y)
              ctx.rotate(-Math.PI / 6)
              ctx.fillText(watermarkText, 0, 0)
              ctx.restore()
            }
          }
        } else {
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20)
        }

        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed')), file.type, 0.92)
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
      img.src = url
    })
  }

  const handleProcess = async () => {
    if (files.length === 0 || !watermarkText.trim()) return
    setProcessing(true)
    setResults([])
    setError(null)

    const newResults: typeof results = []
    for (const file of files) {
      try {
        const blob = await addWatermark(file)
        newResults.push({
          blob,
          filename: file.name.replace(/\.([^.]+)$/, '_watermarked.$1'),
          originalSize: file.size,
        })
      } catch {
        setError(`处理 ${file.name} 失败`)
      }
    }
    setResults(newResults)
    setProcessing(false)
  }

  const handleReset = () => { setFiles([]); setResults([]); setError(null) }

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

      {files.length > 0 && results.length === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">水印文字</label>
            <Input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="输入水印文字" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">字体大小: {fontSize}px</label>
              <Slider value={fontSize} onChange={e => setFontSize(Number(e.target.value))} min={12} max={72} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">透明度: {opacity}%</label>
              <Slider value={opacity} onChange={e => setOpacity(Number(e.target.value))} min={10} max={100} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">颜色</label>
              <div className="flex gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <Input value={color} onChange={e => setColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">位置</label>
              <div className="flex gap-2">
                {(['center', 'tile', 'corner'] as const).map(p => (
                  <button key={p} onClick={() => setPosition(p)} className={`flex-1 py-2 rounded-lg border-2 text-sm ${position === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                    {p === 'center' ? '居中' : p === 'tile' ? '平铺' : '右下角'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={processing || !watermarkText.trim()} className="w-full">
            {processing ? '处理中...' : '添加水印'}
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
