'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateMultipleUUIDs, isValidUUID } from '@/lib/tools/dev/uuid'
import { Copy, Check, RefreshCw } from 'lucide-react'

export function UUIDTool() {
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [validateInput, setValidateInput] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleGenerate = () => {
    setUuids(generateMultipleUUIDs(count))
  }

  const handleCopy = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'))
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleValidate = () => {
    setIsValid(isValidUUID(validateInput))
  }

  return (
    <div className="space-y-6">
      {/* Generator */}
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">生成数量</label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              min={1}
              max={100}
            />
          </div>
          <Button onClick={handleGenerate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            生成
          </Button>
        </div>

        {uuids.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">生成结果</span>
              <Button variant="ghost" size="sm" onClick={handleCopyAll}>
                {copiedIndex === -1 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedIndex === -1 ? '已复制全部' : '复制全部'}
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 max-h-[300px] overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <code className="text-sm font-mono">{uuid}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={() => handleCopy(uuid, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validator */}
      <div className="pt-6 border-t">
        <h3 className="font-medium mb-4">UUID 验证</h3>
        <div className="flex gap-2">
          <Input
            value={validateInput}
            onChange={(e) => { setValidateInput(e.target.value); setIsValid(null) }}
            placeholder="输入要验证的 UUID..."
          />
          <Button onClick={handleValidate} variant="outline">验证</Button>
        </div>
        {isValid !== null && (
          <p className={`mt-2 text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {isValid ? '✓ 有效的 UUID' : '✗ 无效的 UUID'}
          </p>
        )}
      </div>
    </div>
  )
}
