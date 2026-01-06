'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatJson, minifyJson } from '@/lib/tools/text/json-formatter'
import { Copy, Check } from 'lucide-react'

export function JsonFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFormat = () => {
    const result = formatJson(input)
    setOutput(result.formatted)
    setError(result.valid ? null : result.error || null)
  }

  const handleMinify = () => {
    const result = minifyJson(input)
    setOutput(result.formatted)
    setError(result.valid ? null : result.error || null)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入 JSON</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="min-h-[200px]"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleFormat} className="flex-1">格式化</Button>
        <Button onClick={handleMinify} variant="outline" className="flex-1">压缩</Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">输出结果</label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            className="min-h-[200px] bg-gray-50"
          />
        </div>
      )}
    </div>
  )
}
