'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { convertNumberBase, isValidNumber, type NumberBase, type NumberBaseResult } from '@/lib/tools/converter/number-base'
import { Copy, Check } from 'lucide-react'

const BASE_OPTIONS = [
  { value: '2', label: '二进制 (Binary)' },
  { value: '8', label: '八进制 (Octal)' },
  { value: '10', label: '十进制 (Decimal)' },
  { value: '16', label: '十六进制 (Hex)' },
]

export function NumberBaseTool() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState<NumberBase>(10)
  const [result, setResult] = useState<NumberBaseResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleConvert = () => {
    if (!input.trim()) return

    if (!isValidNumber(input, fromBase)) {
      setError(`输入的数字不是有效的 ${fromBase} 进制数`)
      setResult(null)
      return
    }

    try {
      setResult(convertNumberBase(input, fromBase))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setResult(null)
    }
  }

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">输入数字</label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="输入要转换的数字..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">输入进制</label>
          <Select
            options={BASE_OPTIONS}
            value={String(fromBase)}
            onChange={(e) => setFromBase(Number(e.target.value) as NumberBase)}
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
        <div className="space-y-2">
          {[
            { label: '二进制 (Binary)', value: result.binary, field: 'binary' },
            { label: '八进制 (Octal)', value: result.octal, field: 'octal' },
            { label: '十进制 (Decimal)', value: result.decimal, field: 'decimal' },
            { label: '十六进制 (Hex)', value: result.hexadecimal, field: 'hex' },
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
      )}
    </div>
  )
}
