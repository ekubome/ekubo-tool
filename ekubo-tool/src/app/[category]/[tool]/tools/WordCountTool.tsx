'use client'

import { useState, useMemo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Type, Hash, Clock } from 'lucide-react'

export function WordCountTool() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpace: 0,
        words: 0,
        chineseChars: 0,
        englishWords: 0,
        lines: 0,
        paragraphs: 0,
        readingTime: 0,
      }
    }

    const characters = text.length
    const charactersNoSpace = text.replace(/\s/g, '').length
    
    // 中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    
    // 英文单词
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
    
    // 总词数（中文按字算，英文按词算）
    const words = chineseChars + englishWords
    
    // 行数
    const lines = text.split('\n').length
    
    // 段落数（非空行）
    const paragraphs = text.split('\n').filter(line => line.trim()).length
    
    // 阅读时间（假设每分钟阅读 300 字）
    const readingTime = Math.ceil(words / 300)

    return {
      characters,
      charactersNoSpace,
      words,
      chineseChars,
      englishWords,
      lines,
      paragraphs,
      readingTime,
    }
  }, [text])

  const statCards = [
    { icon: Type, label: '字符数', value: stats.characters, subValue: `不含空格: ${stats.charactersNoSpace}` },
    { icon: Hash, label: '词数', value: stats.words, subValue: `中文: ${stats.chineseChars} / 英文: ${stats.englishWords}` },
    { icon: FileText, label: '行数', value: stats.lines, subValue: `段落: ${stats.paragraphs}` },
    { icon: Clock, label: '阅读时间', value: `${stats.readingTime} 分钟`, subValue: '按 300 字/分钟计算' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">输入文本</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此输入或粘贴文本..."
          className="min-h-[250px]"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <card.icon className="w-4 h-4" />
              <span className="text-sm">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
