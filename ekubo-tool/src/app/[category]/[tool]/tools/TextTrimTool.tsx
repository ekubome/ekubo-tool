'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check } from 'lucide-react'

export function TextTrimTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<{ charsBefore: number; charsAfter: number; linesBefore: number; linesAfter: number } | null>(null)

  const [options, setOptions] = useState({
    trimLines: true,
    removeEmptyLines: true,
    collapseSpaces: true,
    removeLeadingSpaces: false,
    removeTrailingSpaces: false,
    collapseEmptyLines: false,
  })

  const handleProcess = () => {
    let result = input
    const linesBefore = input.split('\n').length
    const charsBefore = input.length

    // trimLines 包含了 removeLeadingSpaces 和 removeTrailingSpaces 的功能
    // 所以如果 trimLines 为 true，就不需要再单独处理
    if (options.trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n')
    } else {
      // 只有 trimLines 为 false 时才单独处理
      if (options.removeLeadingSpaces) {
        result = result.split('\n').map(line => line.trimStart()).join('\n')
      }
      if (options.removeTrailingSpaces) {
        result = result.split('\n').map(line => line.trimEnd()).join('\n')
      }
    }

    if (options.collapseSpaces) {
      result = result.replace(/[^\S\n]+/g, ' ')
    }

    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n')
    } else if (options.collapseEmptyLines) {
      result = result.replace(/\n{3,}/g, '\n\n')
    }

    setOutput(result)
    setStats({
      charsBefore,
      charsAfter: result.length,
      linesBefore,
      linesAfter: result.split('\n').length,
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const optionsList = [
    { key: 'trimLines', label: '去除每行首尾空格' },
    { key: 'removeEmptyLines', label: '删除空行' },
    { key: 'collapseSpaces', label: '合并连续空格' },
    { key: 'removeLeadingSpaces', label: '去除行首空格' },
    { key: 'removeTrailingSpaces', label: '去除行尾空格' },
    { key: 'collapseEmptyLines', label: '合并连续空行' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入文本</label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要处理的文本..."
          className="min-h-[180px] font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">处理选项</label>
        <div className="grid grid-cols-2 gap-2">
          {optionsList.map(opt => (
            <label key={opt.key} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={options[opt.key as keyof typeof options]}
                onChange={e => setOptions({ ...options, [opt.key]: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleProcess} className="w-full" disabled={!input}>
        处理文本
      </Button>

      {stats && (
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">字符数</p>
              <p className="font-medium">{stats.charsBefore} → <span className="text-green-600">{stats.charsAfter}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-500">行数</p>
              <p className="font-medium">{stats.linesBefore} → <span className="text-green-600">{stats.linesAfter}</span></p>
            </div>
          </div>
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">处理结果</label>
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
