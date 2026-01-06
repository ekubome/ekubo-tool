'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { generateQRCode } from '@/lib/tools/dev/qrcode'
import { Download } from 'lucide-react'

export function QRCodeTool() {
  const [text, setText] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [size, setSize] = useState(256)

  const handleGenerate = async () => {
    if (!text.trim()) return
    try {
      const dataUrl = await generateQRCode(text, { width: size })
      setQrCode(dataUrl)
    } catch (error) {
      console.error('QR code generation failed:', error)
    }
  }

  const handleDownload = () => {
    if (!qrCode) return
    const a = document.createElement('a')
    a.href = qrCode
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">输入内容</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要生成二维码的文本或链接..."
          className="min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">二维码大小</label>
        <Input
          type="number"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          min={128}
          max={512}
          step={64}
        />
      </div>

      <Button onClick={handleGenerate} className="w-full" disabled={!text.trim()}>
        生成二维码
      </Button>

      {qrCode && (
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl">
          <img src={qrCode} alt="QR Code" className="border rounded-lg" />
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            下载二维码
          </Button>
        </div>
      )}
    </div>
  )
}
