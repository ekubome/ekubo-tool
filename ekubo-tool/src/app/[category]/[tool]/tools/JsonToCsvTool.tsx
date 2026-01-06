'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Download } from 'lucide-react'

export function JsonToCsvTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [delimiter, setDelimiter] = useState(',')

  const jsonToCsv = (jsonStr: string): string => {
    const data = JSON.parse(jsonStr)
    const array = Array.isArray(data) ? data : [data]
    
    if (array.length === 0) return ''
    
    // 获取所有键
    const allKeys = new Set<string>()
    array.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key))
      }
    })
    const headers = Array.from(allKeys)
    
    // 转义 CSV 值
    const escapeValue = (val: unknown): string => {
      if (val === null || val === undefined) return ''
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }
    
    // 生成 CSV
    const rows = [headers.join(delimiter)]
    array.forEach(item => {
      const row = headers.map(key => escapeValue(item?.[key]))
      rows.push(row.join(delimiter))
    })
    
    return rows.join('\n')
  }

  const csvToJson = (csvStr: string): string => {
    const lines = csvStr.trim().split('\n').filter(line => line.trim() !== '')
    if (lines.length === 0) throw new Error('CSV 内容为空')
    if (lines.length === 1) throw new Error('CSV 只有标题行，没有数据')
    
    const parseRow = (row: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i]
        if (char === '"') {
          if (inQuotes && row[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
      result.push(current)
      return result
    }
    
    const headers = parseRow(lines[0])
    const data = lines.slice(1).map(line => {
      const values = parseRow(line)
      const obj: Record<string, string> = {}
      headers.forEach((header, i) => {
        obj[header] = values[i] || ''
      })
      return obj
    })
    
    return JSON.stringify(data, null, 2)
  }

  const handleConvert = (direction: 'tocsv' | 'tojson') => {
    setError(null)
    try {
      if (direction === 'tocsv') {
        setOutput(jsonToCsv(input))
      } else {
        setOutput(csvToJson(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const isJson = output.trim().startsWith('[') || output.trim().startsWith('{')
    const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = isJson ? 'data.json' : 'data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入 JSON 或 CSV</label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'JSON 示例:\n[{"name":"张三","age":25},{"name":"李四","age":30}]\n\nCSV 示例:\nname,age\n张三,25\n李四,30'}
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">分隔符:</label>
          <select
            value={delimiter}
            onChange={e => setDelimiter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value=",">逗号 (,)</option>
            <option value=";">分号 (;)</option>
            <option value="\t">制表符 (Tab)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => handleConvert('tocsv')} className="flex-1" disabled={!input.trim()}>
          JSON → CSV
        </Button>
        <Button onClick={() => handleConvert('tojson')} variant="outline" className="flex-1" disabled={!input.trim()}>
          CSV → JSON
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">转换结果</label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? '已复制' : '复制'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />下载
              </Button>
            </div>
          </div>
          <Textarea value={output} readOnly className="min-h-[200px] font-mono text-sm bg-gray-50" />
        </div>
      )}
    </div>
  )
}
