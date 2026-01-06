'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Download } from 'lucide-react'

export function JsonToYamlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 简单的 JSON 转 YAML 实现
  const jsonToYaml = (obj: unknown, indent = 0): string => {
    const spaces = '  '.repeat(indent)
    
    if (obj === null) return 'null'
    if (obj === undefined) return ''
    if (typeof obj === 'boolean') return obj ? 'true' : 'false'
    if (typeof obj === 'number') return String(obj)
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || 
          obj.startsWith(' ') || obj.endsWith(' ') || /^[\d.]+$/.test(obj) ||
          ['true', 'false', 'null', 'yes', 'no'].includes(obj.toLowerCase())) {
        return `"${obj.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
      }
      return obj
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj.map(item => {
        const value = jsonToYaml(item, indent + 1)
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return `${spaces}- ${value.trim().replace(/\n/g, '\n' + spaces + '  ')}`
        }
        return `${spaces}- ${value}`
      }).join('\n')
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'
      return entries.map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1)
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            return `${spaces}${key}:\n${yamlValue}`
          }
          if (!Array.isArray(value) && Object.keys(value).length > 0) {
            return `${spaces}${key}:\n${yamlValue}`
          }
        }
        return `${spaces}${key}: ${yamlValue}`
      }).join('\n')
    }
    
    return String(obj)
  }

  // 简单的 YAML 转 JSON 实现
  const yamlToJson = (yaml: string): unknown => {
    const lines = yaml.split('\n')
    const stack: { indent: number; obj: Record<string, unknown>; key?: string }[] = []
    let root: Record<string, unknown> | unknown[] = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim() === '' || line.trim().startsWith('#')) continue
      
      const indent = line.search(/\S/)
      if (indent === -1) continue
      const content = line.trim()
      
      // 弹出缩进更大或相等的栈（除了数组项）
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent && !content.startsWith('- ')) {
        stack.pop()
      }
      
      // 处理数组项
      if (content.startsWith('- ')) {
        const value = parseYamlValue(content.slice(2))
        
        if (stack.length === 0) {
          if (!Array.isArray(root)) root = []
          ;(root as unknown[]).push(value)
        } else {
          const parent = stack[stack.length - 1]
          if (parent.key !== undefined) {
            if (!Array.isArray(parent.obj[parent.key])) {
              parent.obj[parent.key] = []
            }
            (parent.obj[parent.key] as unknown[]).push(value)
          }
        }
        continue
      }
      
      // 处理键值对
      const colonIndex = content.indexOf(':')
      if (colonIndex > 0) {
        const key = content.slice(0, colonIndex).trim()
        const valueStr = content.slice(colonIndex + 1).trim()
        
        // 获取当前父对象
        let parent: Record<string, unknown>
        if (stack.length === 0) {
          if (Array.isArray(root)) {
            // 如果 root 是数组，这是错误的 YAML
            throw new Error('Invalid YAML structure')
          }
          parent = root as Record<string, unknown>
        } else {
          const stackTop = stack[stack.length - 1]
          if (stackTop.key !== undefined) {
            parent = stackTop.obj[stackTop.key] as Record<string, unknown>
          } else {
            parent = stackTop.obj
          }
        }
        
        if (valueStr === '' || valueStr === '|' || valueStr === '>') {
          // 嵌套对象
          const newObj: Record<string, unknown> = {}
          parent[key] = newObj
          stack.push({ indent, obj: parent, key })
        } else {
          parent[key] = parseYamlValue(valueStr)
        }
      }
    }
    
    return root
  }

  const parseYamlValue = (str: string): unknown => {
    str = str.trim()
    if (str === 'null' || str === '~') return null
    if (str === 'true' || str === 'yes') return true
    if (str === 'false' || str === 'no') return false
    if (/^-?\d+$/.test(str)) return parseInt(str, 10)
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str)
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"')
    }
    if (str === '[]') return []
    if (str === '{}') return {}
    return str
  }

  const handleConvert = (direction: 'toyaml' | 'tojson') => {
    setError(null)
    try {
      if (direction === 'toyaml') {
        const json = JSON.parse(input)
        setOutput(jsonToYaml(json))
      } else {
        const json = yamlToJson(input)
        setOutput(JSON.stringify(json, null, 2))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败，请检查格式')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const isJson = output.trim().startsWith('{') || output.trim().startsWith('[')
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = isJson ? 'data.json' : 'data.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">输入 JSON 或 YAML</label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'JSON 示例:\n{\n  "name": "张三",\n  "age": 25,\n  "hobbies": ["读书", "游泳"]\n}\n\nYAML 示例:\nname: 张三\nage: 25\nhobbies:\n  - 读书\n  - 游泳'}
          className="min-h-[220px] font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => handleConvert('toyaml')} className="flex-1" disabled={!input.trim()}>
          JSON → YAML
        </Button>
        <Button onClick={() => handleConvert('tojson')} variant="outline" className="flex-1" disabled={!input.trim()}>
          YAML → JSON
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
          <Textarea value={output} readOnly className="min-h-[220px] font-mono text-sm bg-gray-50" />
        </div>
      )}
    </div>
  )
}
