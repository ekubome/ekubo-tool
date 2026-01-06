'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, Check, Eye, Code } from 'lucide-react'

// 简单的 Markdown 解析器
function parseMarkdown(md: string): string {
  let html = md
    // 转义 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-3"><code>$1</code></pre>')
    // 行内代码
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // 链接 (过滤危险协议)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-3" />')
    // 无序列表
    .replace(/^\s*[-*+] (.*$)/gim, '<li class="ml-4">$1</li>')
    // 有序列表
    .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // 引用
    .replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">$1</blockquote>')
    // 水平线
    .replace(/^---$/gim, '<hr class="my-6 border-gray-200" />')
    // 段落
    .replace(/\n\n/g, '</p><p class="my-3">')

  return `<p class="my-3">${html}</p>`
}

const SAMPLE_MARKDOWN = `# Markdown 预览示例

## 基本语法

这是一段普通文本，支持 **粗体**、*斜体* 和 ***粗斜体***。

### 代码

行内代码：\`const hello = "world"\`

代码块：
\`\`\`
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

### 列表

- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

### 链接和引用

[访问 GitHub](https://github.com)

> 这是一段引用文字

---

感谢使用 ekubo-tool！
`

export function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN)
  const [view, setView] = useState<'split' | 'preview' | 'edit'>('split')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const html = parseMarkdown(markdown)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={view === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('edit')}
          >
            <Code className="w-4 h-4 mr-1" />
            编辑
          </Button>
          <Button
            variant={view === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('split')}
          >
            分栏
          </Button>
          <Button
            variant={view === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('preview')}
          >
            <Eye className="w-4 h-4 mr-1" />
            预览
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '已复制' : '复制'}
        </Button>
      </div>

      {/* Editor & Preview */}
      <div className={`grid gap-4 ${view === 'split' ? 'md:grid-cols-2' : ''}`}>
        {(view === 'edit' || view === 'split') && (
          <div>
            <label className="block text-sm font-medium mb-2">Markdown</label>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="输入 Markdown 内容..."
            />
          </div>
        )}
        {(view === 'preview' || view === 'split') && (
          <div>
            <label className="block text-sm font-medium mb-2">预览</label>
            <div
              className="min-h-[400px] p-4 bg-white border rounded-lg overflow-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
