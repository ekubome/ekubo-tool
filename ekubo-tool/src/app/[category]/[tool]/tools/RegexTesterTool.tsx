'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Check } from 'lucide-react'

interface RegexResult {
  valid: true
  matches: string[] | null
  matchCount: number
  highlightedText: string
}

interface RegexError {
  valid: false
  error: string
}

type Result = RegexResult | RegexError | null

export function RegexTesterTool() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('')

  const result: Result = useMemo(() => {
    if (!pattern || !testText) return null

    try {
      const regex = new RegExp(pattern, flags)
      const matches = testText.match(regex)
      const matchCount = matches ? matches.length : 0

      // 安全的 HTML 转义函数
      const escapeHtml = (str: string) => 
        str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

      // 高亮匹配 - 使用更安全的方式
      let highlightedText = escapeHtml(testText)
      
      if (matches && matches.length > 0) {
        // 找到所有匹配的位置和内容，从后往前替换避免位置偏移
        const allMatches: { index: number; length: number; text: string }[] = []
        let match: RegExpExecArray | null
        
        // 对于全局匹配，需要重新创建正则
        const execRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
        while ((match = execRegex.exec(testText)) !== null) {
          allMatches.push({ index: match.index, length: match[0].length, text: match[0] })
          // 防止无限循环（空匹配）
          if (match[0].length === 0) execRegex.lastIndex++
        }

        // 从后往前替换，避免索引偏移问题
        highlightedText = testText
        for (let i = allMatches.length - 1; i >= 0; i--) {
          const m = allMatches[i]
          const before = highlightedText.slice(0, m.index)
          const after = highlightedText.slice(m.index + m.length)
          const highlighted = `\x00MARK_START\x00${m.text}\x00MARK_END\x00`
          highlightedText = before + highlighted + after
        }
        
        // 先转义 HTML，再替换标记
        highlightedText = escapeHtml(highlightedText)
          .replace(/\x00MARK_START\x00/g, '<mark class="bg-yellow-200 px-0.5 rounded">')
          .replace(/\x00MARK_END\x00/g, '</mark>')
      }

      return {
        valid: true as const,
        matches,
        matchCount,
        highlightedText,
      }
    } catch (e) {
      return {
        valid: false as const,
        error: e instanceof Error ? e.message : '无效的正则表达式',
      }
    }
  }, [pattern, flags, testText])

  const commonPatterns = [
    { label: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { label: '手机号', pattern: '1[3-9]\\d{9}' },
    { label: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+' },
    { label: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
    { label: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
  ]

  const isValidResult = (r: Result): r is RegexResult => {
    return r !== null && r.valid === true
  }

  const isErrorResult = (r: Result): r is RegexError => {
    return r !== null && r.valid === false
  }

  return (
    <div className="space-y-6">
      {/* Pattern Input */}
      <div>
        <label className="block text-sm font-medium mb-2">正则表达式</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-50 rounded-lg border px-3">
            <span className="text-gray-400">/</span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式..."
              className="border-0 bg-transparent focus:ring-0"
            />
            <span className="text-gray-400">/</span>
          </div>
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-20"
          />
        </div>
        {isErrorResult(result) && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {result.error}
          </p>
        )}
      </div>

      {/* Common Patterns */}
      <div>
        <label className="block text-sm font-medium mb-2">常用正则</label>
        <div className="flex flex-wrap gap-2">
          {commonPatterns.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="sm"
              onClick={() => setPattern(item.pattern)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Test Text */}
      <div>
        <label className="block text-sm font-medium mb-2">测试文本</label>
        <Textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="输入要测试的文本..."
          className="min-h-[150px]"
        />
      </div>

      {/* Results */}
      {isValidResult(result) && testText && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1 text-sm ${result.matchCount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {result.matchCount > 0 ? <Check className="w-4 h-4" /> : null}
              {result.matchCount} 个匹配
            </span>
          </div>

          {/* Highlighted Text */}
          <div>
            <label className="block text-sm font-medium mb-2">匹配结果</label>
            <div
              className="p-4 bg-gray-50 rounded-xl font-mono text-sm whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: result.highlightedText }}
            />
          </div>

          {/* Match List */}
          {result.matches && result.matches.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">匹配列表</label>
              <div className="flex flex-wrap gap-2">
                {result.matches.map((match, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono"
                  >
                    {match}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
