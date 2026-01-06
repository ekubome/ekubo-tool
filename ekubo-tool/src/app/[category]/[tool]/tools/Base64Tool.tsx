'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { encodeBase64, decodeBase64 } from '@/lib/tools/dev/base64'
import { Copy, Check } from 'lucide-react'

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleEncode = () => {
    try {
      setOutput(encodeBase64(input))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '编码失败')
    }
  }

  const handleDecode = () => {
    try {
      setOutput(decodeBase64(input))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '解码失败')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入文本</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要编码或解码的文本..."
          className="min-h-[150px]"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleEncode} className="flex-1">编码</Button>
        <Button onClick={handleDecode} variant="outline" className="flex-1">解码</Button>
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
            className="min-h-[150px] bg-gray-50"
          />
        </div>
      )}
    </div>
  )
}
