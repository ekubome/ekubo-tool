'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseColor, type ColorResult } from '@/lib/tools/dev/color'
import { Copy, Check } from 'lucide-react'

export function ColorConverterTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ColorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleConvert = () => {
    const parsed = parseColor(input)
    if (parsed) {
      setResult(parsed)
      setError(null)
    } else {
      setResult(null)
      setError('无法解析颜色，请输入有效的 HEX 或 RGB 格式')
    }
  }

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">输入颜色</label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#FF5733 或 rgb(255, 87, 51)"
          />
          <input
            type="color"
            value={result?.hex || '#000000'}
            onChange={(e) => { setInput(e.target.value); setResult(parseColor(e.target.value)) }}
            className="w-10 h-10 rounded cursor-pointer"
          />
        </div>
      </div>

      <Button onClick={handleConvert} className="w-full">转换</Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Color Preview */}
          <div
            className="h-24 rounded-xl border"
            style={{ backgroundColor: result.hex }}
          />

          {/* Color Values */}
          <div className="space-y-2">
            {[
              { label: 'HEX', value: result.hex, field: 'hex' },
              { label: 'RGB', value: result.rgbString, field: 'rgb' },
              { label: 'HSL', value: result.hslString, field: 'hsl' },
            ].map(({ label, value, field }) => (
              <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">{label}</span>
                  <p className="font-mono">{value}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(value, field)}>
                  {copiedField === field ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
