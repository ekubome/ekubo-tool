'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeftRight, Copy, Check } from 'lucide-react'

interface DiffResult {
  type: 'equal' | 'add' | 'remove'
  value: string
}

function computeDiff(text1: string, text2: string): DiffResult[] {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')
  const result: DiffResult[] = []

  const maxLen = Math.max(lines1.length, lines2.length)

  for (let i = 0; i < maxLen; i++) {
    const line1 = lines1[i]
    const line2 = lines2[i]

    if (line1 === undefined) {
      result.push({ type: 'add', value: line2 })
    } else if (line2 === undefined) {
      result.push({ type: 'remove', value: line1 })
    } else if (line1 === line2) {
      result.push({ type: 'equal', value: line1 })
    } else {
      result.push({ type: 'remove', value: line1 })
      result.push({ type: 'add', value: line2 })
    }
  }

  return result
}

export function TextDiffTool() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [diff, setDiff] = useState<DiffResult[] | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCompare = () => {
    if (!text1.trim() && !text2.trim()) return
    setDiff(computeDiff(text1, text2))
  }

  const handleSwap = () => {
    const temp = text1
    setText1(text2)
    setText2(temp)
    setDiff(null)
  }

  const handleClear = () => {
    setText1('')
    setText2('')
    setDiff(null)
  }

  const handleCopyDiff = async () => {
    if (!diff) return
    const diffText = diff
      .map((d) => {
        if (d.type === 'add') return `+ ${d.value}`
        if (d.type === 'remove') return `- ${d.value}`
        return `  ${d.value}`
      })
      .join('\n')
    await navigator.clipboard.writeText(diffText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = diff
    ? {
        added: diff.filter((d) => d.type === 'add').length,
        removed: diff.filter((d) => d.type === 'remove').length,
        unchanged: diff.filter((d) => d.type === 'equal').length,
      }
    : null

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">原始文本</label>
          <Textarea
            value={text1}
            onChange={(e) => { setText1(e.target.value); setDiff(null) }}
            placeholder="输入原始文本..."
            className="min-h-[200px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">对比文本</label>
          <Textarea
            value={text2}
            onChange={(e) => { setText2(e.target.value); setDiff(null) }}
            placeholder="输入要对比的文本..."
            className="min-h-[200px]"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCompare} className="flex-1">
          开始对比
        </Button>
        <Button variant="outline" onClick={handleSwap}>
          <ArrowLeftRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={handleClear}>
          清空
        </Button>
      </div>

      {diff && (
        <div className="space-y-4">
          {/* Stats */}
          {stats && (
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">+ {stats.added} 新增</span>
              <span className="text-red-600">- {stats.removed} 删除</span>
              <span className="text-gray-500">{stats.unchanged} 相同</span>
            </div>
          )}

          {/* Diff Result */}
          <div className="relative">
            <div className="absolute top-2 right-2">
              <Button variant="ghost" size="sm" onClick={handleCopyDiff}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm max-h-[400px] overflow-auto">
              {diff.map((item, index) => (
                <div
                  key={index}
                  className={`px-2 py-0.5 ${
                    item.type === 'add'
                      ? 'bg-green-100 text-green-800'
                      : item.type === 'remove'
                      ? 'bg-red-100 text-red-800'
                      : ''
                  }`}
                >
                  <span className="inline-block w-6 text-gray-400">
                    {item.type === 'add' ? '+' : item.type === 'remove' ? '-' : ' '}
                  </span>
                  {item.value || ' '}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
