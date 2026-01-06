'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check } from 'lucide-react'

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'toggle'

export function TextCaseTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const convertCase = (text: string, type: CaseType): string => {
    switch (type) {
      case 'upper':
        return text.toUpperCase()
      case 'lower':
        return text.toLowerCase()
      case 'title':
        return text.replace(/\b\w/g, c => c.toUpperCase())
      case 'sentence':
        return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
      case 'camel':
        // 保留中文和其他非ASCII字符
        return text
          .replace(/[\s_-]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
          .replace(/^[A-Z]/, c => c.toLowerCase())
      case 'pascal':
        return text
          .replace(/[\s_-]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
          .replace(/^[a-z]/, c => c.toUpperCase())
      case 'snake':
        return text
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .replace(/_+/g, '_')
          .toLowerCase()
      case 'kebab':
        return text
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase()
      case 'toggle':
        return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')
      default:
        return text
    }
  }

  const handleConvert = (type: CaseType) => {
    setOutput(convertCase(input, type))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const caseOptions: { value: CaseType; label: string; example: string }[] = [
    { value: 'upper', label: '全部大写', example: 'HELLO WORLD' },
    { value: 'lower', label: '全部小写', example: 'hello world' },
    { value: 'title', label: '首字母大写', example: 'Hello World' },
    { value: 'sentence', label: '句首大写', example: 'Hello world. How are you?' },
    { value: 'camel', label: '驼峰命名', example: 'helloWorld' },
    { value: 'pascal', label: '帕斯卡命名', example: 'HelloWorld' },
    { value: 'snake', label: '下划线命名', example: 'hello_world' },
    { value: 'kebab', label: '短横线命名', example: 'hello-world' },
    { value: 'toggle', label: '大小写反转', example: 'hELLO wORLD' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入文本</label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要转换的文本..."
          className="min-h-[150px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">选择转换类型</label>
        <div className="grid grid-cols-3 gap-2">
          {caseOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleConvert(opt.value)}
              disabled={!input.trim()}
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-gray-500 font-mono truncate">{opt.example}</p>
            </button>
          ))}
        </div>
      </div>

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">转换结果</label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea value={output} readOnly className="min-h-[150px] bg-gray-50" />
        </div>
      )}
    </div>
  )
}
