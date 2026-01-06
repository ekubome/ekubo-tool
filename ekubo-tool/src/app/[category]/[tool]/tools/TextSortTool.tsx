'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, ArrowUpAZ, ArrowDownAZ, Shuffle } from 'lucide-react'

type SortType = 'asc' | 'desc' | 'reverse' | 'random' | 'length-asc' | 'length-desc' | 'numeric-asc' | 'numeric-desc'

export function TextSortTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [sortType, setSortType] = useState<SortType>('asc')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [removeEmpty, setRemoveEmpty] = useState(true)

  const handleSort = () => {
    let lines = input.split('\n')
    
    if (removeEmpty) {
      lines = lines.filter(line => line.trim() !== '')
    }

    if (removeDuplicates) {
      const seen = new Set<string>()
      lines = lines.filter(line => {
        const key = caseSensitive ? line : line.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    switch (sortType) {
      case 'asc':
        lines.sort((a, b) => caseSensitive ? a.localeCompare(b, 'zh-CN') : a.toLowerCase().localeCompare(b.toLowerCase(), 'zh-CN'))
        break
      case 'desc':
        lines.sort((a, b) => caseSensitive ? b.localeCompare(a, 'zh-CN') : b.toLowerCase().localeCompare(a.toLowerCase(), 'zh-CN'))
        break
      case 'reverse':
        lines.reverse()
        break
      case 'random':
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[lines[i], lines[j]] = [lines[j], lines[i]]
        }
        break
      case 'length-asc':
        lines.sort((a, b) => a.length - b.length)
        break
      case 'length-desc':
        lines.sort((a, b) => b.length - a.length)
        break
      case 'numeric-asc':
        lines.sort((a, b) => {
          const numA = parseFloat(a) || 0
          const numB = parseFloat(b) || 0
          return numA - numB
        })
        break
      case 'numeric-desc':
        lines.sort((a, b) => {
          const numA = parseFloat(a) || 0
          const numB = parseFloat(b) || 0
          return numB - numA
        })
        break
    }

    setOutput(lines.join('\n'))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sortOptions: { value: SortType; label: string; icon?: React.ReactNode }[] = [
    { value: 'asc', label: 'A → Z', icon: <ArrowUpAZ className="w-4 h-4" /> },
    { value: 'desc', label: 'Z → A', icon: <ArrowDownAZ className="w-4 h-4" /> },
    { value: 'reverse', label: '倒序' },
    { value: 'random', label: '随机', icon: <Shuffle className="w-4 h-4" /> },
    { value: 'length-asc', label: '长度↑' },
    { value: 'length-desc', label: '长度↓' },
    { value: 'numeric-asc', label: '数字↑' },
    { value: 'numeric-desc', label: '数字↓' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入文本（每行一条）</label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要排序的文本，每行一条..."
          className="min-h-[180px] font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">排序方式</label>
        <div className="grid grid-cols-4 gap-2">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortType(opt.value)}
              className={`py-2 px-3 rounded-lg border-2 text-sm font-medium flex items-center justify-center gap-1 ${
                sortType === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="rounded" />
          区分大小写
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={removeDuplicates} onChange={e => setRemoveDuplicates(e.target.checked)} className="rounded" />
          去除重复
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={removeEmpty} onChange={e => setRemoveEmpty(e.target.checked)} className="rounded" />
          去除空行
        </label>
      </div>

      <Button onClick={handleSort} className="w-full" disabled={!input.trim()}>
        排序
      </Button>

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">排序结果 ({output.split('\n').length} 行)</label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea value={output} readOnly className="min-h-[180px] font-mono text-sm bg-gray-50" />
        </div>
      )}
    </div>
  )
}
