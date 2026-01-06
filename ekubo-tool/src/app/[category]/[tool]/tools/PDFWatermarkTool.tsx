'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import { Download } from 'lucide-react'

export function PDFWatermarkTool() {
  const [files, setFiles] = useState<File[]>([])
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(30)
  const [rotation, setRotation] = useState(45)
  const [color, setColor] = useState('#888888')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0.5, g: 0.5, b: 0.5 }
  }

  const handleAddWatermark = async () => {
    if (files.length === 0 || !watermarkText.trim()) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setProgress(20)

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const { r, g, b } = hexToRgb(color)
      const radians = (rotation * Math.PI) / 180

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        
        // 计算水印文字宽度
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)
        
        // 在页面中心绘制水印
        const x = (width - textWidth * Math.cos(radians)) / 2
        const y = height / 2

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacity / 100,
          rotate: degrees(rotation),
        })

        setProgress(20 + ((i + 1) / pages.length) * 70)
      }

      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      setResult(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }))
    } catch (err) {
      console.error('Watermark failed:', err)
      setError('添加水印失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = files[0].name.replace('.pdf', '_watermarked.pdf')
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
        accept={['.pdf']}
        maxSize={50 * 1024 * 1024}
        files={files}
        onFilesSelected={(newFiles) => { setFiles(newFiles); setResult(null) }}
        onRemoveFile={() => { setFiles([]); setResult(null) }}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && !result && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">水印文字</label>
            <Input
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="输入水印文字（建议使用英文）"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              注意：由于技术限制，中文可能显示为方块，建议使用英文或数字
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">字体大小</label>
              <Slider
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={12}
                max={120}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">透明度</label>
              <Slider
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                min={5}
                max={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">旋转角度</label>
              <Slider
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                min={-90}
                max={90}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">颜色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-6 bg-gray-100 rounded-xl relative overflow-hidden h-32 flex items-center justify-center">
            <span
              style={{
                fontSize: `${Math.min(fontSize, 32)}px`,
                color: color,
                opacity: opacity / 100,
                transform: `rotate(${rotation}deg)`,
              }}
              className="font-bold whitespace-nowrap"
            >
              {watermarkText || '水印预览'}
            </span>
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleAddWatermark} className="w-full" disabled={!watermarkText.trim()}>
              添加水印
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-4">水印添加完成！</p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              下载 PDF
            </Button>
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">
            处理其他文件
          </Button>
        </div>
      )}
    </div>
  )
}
