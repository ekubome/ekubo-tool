'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check } from 'lucide-react'

export function TextDedupeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState<{ original: number; unique: number; removed: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [trimLines, setTrimLines] = useState(true)

  const handleDedupe = () => {
    const lines = input.split('\n')
    const seen = new Set<string>()
    const uniqueLines: string[] = []

    for (const line of lines) {
      const processedLine = trimLines ? line.trim() : line
      const compareKey = caseSensitive ? processedLine : processedLine.toLowerCase()
      
      // 空行特殊处理：如果已经有空行了就跳过
      if (processedLine === '' && seen.has('')) {
        continue
      }
      
      if (!seen.has(compareKey)) {
        seen.add(compareKey)
        uniqueLines.push(processedLine)
      }
    }

    setOutput(uniqueLines.join('\n'))
    setStats({
      original: lines.length,
      unique: uniqueLines.length,
      removed: lines.length - uniqueLines.length,
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入文本（每行一条）</label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要去重的文本，每行一条..."
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="rounded" />
          区分大小写
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={trimLines} onChange={e => setTrimLines(e.target.checked)} className="rounded" />
          去除首尾空格
        </label>
      </div>

      <Button onClick={handleDedupe} className="w-full" disabled={!input.trim()}>
        去除重复行
      </Button>

      {stats && (
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.original}</p>
              <p className="text-sm text-gray-500">原始行数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.unique}</p>
              <p className="text-sm text-gray-500">去重后</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.removed}</p>
              <p className="text-sm text-gray-500">删除行数</p>
            </div>
          </div>
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">去重结果</label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea value={output} readOnly className="min-h-[200px] font-mono text-sm bg-gray-50" />
        </div>
      )}
    </div>
  )
}
