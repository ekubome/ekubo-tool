'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { convertPdfToMarkdown, type PdfToMdOptions } from '@/lib/tools/pdf/pdf-to-md'
import { Download, Copy, Check, FileText, Eye, Code } from 'lucide-react'

export function PDFToMarkdownTool() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ markdown: string; pageCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'markdown' | 'preview'>('markdown')
  
  // 选项
  const [options, setOptions] = useState<PdfToMdOptions>({
    preserveLineBreaks: false,
    detectHeadings: true,
    detectLists: true,
  })

  const handleFileSelect = (newFiles: File[]) => {
    setFiles(newFiles)
    setResult(null)
    setError(null)
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const conversionResult = await convertPdfToMarkdown(files[0], options, setProgress)
      
      if (!conversionResult.markdown.trim()) {
        setError('未能从 PDF 中提取到文本内容。可能是扫描版 PDF 或图片型 PDF，这类文件需要 OCR 识别。')
      } else {
        setResult({
          markdown: conversionResult.markdown,
          pageCount: conversionResult.pageCount
        })
      }
    } catch (err) {
      console.error('PDF 转换失败:', err)
      const errorMessage = err instanceof Error ? err.message : 'PDF 转换失败，请确保文件是有效的 PDF 文档'
      setError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = files[0].name.replace('.pdf', '.md')
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setError(null)
    setProgress(0)
  }

  // 简单的 Markdown 预览渲染（XSS 安全处理）
  const renderMarkdownPreview = (md: string) => {
    // 先转义 HTML 特殊字符
    const escapeHtml = (str: string) => 
      str.replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
    
    // 按行处理
    const lines = md.split('\n')
    const htmlLines: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (!trimmed) {
        htmlLines.push('<br />')
        continue
      }
      
      // 分隔线
      if (trimmed === '---') {
        htmlLines.push('<hr class="my-4 border-gray-300" />')
        continue
      }
      
      // 标题
      if (trimmed.startsWith('### ')) {
        htmlLines.push(`<h3 class="text-lg font-semibold mt-4 mb-2">${escapeHtml(trimmed.slice(4))}</h3>`)
        continue
      }
      if (trimmed.startsWith('## ')) {
        htmlLines.push(`<h2 class="text-xl font-bold mt-6 mb-3">${escapeHtml(trimmed.slice(3))}</h2>`)
        continue
      }
      if (trimmed.startsWith('# ')) {
        htmlLines.push(`<h1 class="text-2xl font-bold mt-6 mb-4">${escapeHtml(trimmed.slice(2))}</h1>`)
        continue
      }
      
      // 无序列表
      if (trimmed.startsWith('- ')) {
        htmlLines.push(`<li class="ml-4 list-disc">${escapeHtml(trimmed.slice(2))}</li>`)
        continue
      }
      
      // 有序列表
      const orderedMatch = trimmed.match(/^(\d+)\. (.+)$/)
      if (orderedMatch) {
        htmlLines.push(`<li class="ml-4 list-decimal"><span class="font-medium">${orderedMatch[1]}.</span> ${escapeHtml(orderedMatch[2])}</li>`)
        continue
      }
      
      // 普通段落
      htmlLines.push(`<p class="my-1">${escapeHtml(trimmed)}</p>`)
    }
    
    return `<div class="prose prose-sm max-w-none">${htmlLines.join('')}</div>`
  }

  return (
    <div className="space-y-6">
      {!result && (
        <>
          <FileUploader
            accept={['.pdf']}
            maxSize={50 * 1024 * 1024}
            files={files}
            onFilesSelected={handleFileSelect}
            onRemoveFile={() => { setFiles([]); setError(null) }}
          />

          {files.length > 0 && (
            <div className="space-y-4">
              {/* 选项 */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="text-sm font-medium text-gray-700">转换选项</p>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.detectHeadings}
                    onChange={(e) => setOptions({ ...options, detectHeadings: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">自动检测标题（根据字体大小）</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.detectLists}
                    onChange={(e) => setOptions({ ...options, detectLists: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">自动检测列表</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.preserveLineBreaks}
                    onChange={(e) => setOptions({ ...options, preserveLineBreaks: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">保留原始换行</span>
                </label>
              </div>

              {processing ? (
                <ProgressBar progress={progress} />
              ) : (
                <Button onClick={handleConvert} className="w-full">
                  开始转换
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* 信息栏 */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-green-800">
                转换成功！共 {result.pageCount} 页
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? '已复制' : '复制'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                下载 .md
              </Button>
            </div>
          </div>

          {/* 视图切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('markdown')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === 'markdown' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Code className="w-4 h-4" />
              Markdown 源码
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === 'preview' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
          </div>

          {/* 内容显示 */}
          {viewMode === 'markdown' ? (
            <Textarea
              value={result.markdown}
              readOnly
              className="min-h-[400px] font-mono text-sm bg-gray-50"
            />
          ) : (
            <div 
              className="min-h-[400px] p-4 bg-white border rounded-xl overflow-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(result.markdown) }}
            />
          )}

          <Button variant="outline" onClick={handleReset} className="w-full">
            转换其他文件
          </Button>
        </div>
      )}

      {/* 说明 */}
      <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
        <p className="font-medium mb-2">使用说明</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>支持文本型 PDF 文件，扫描版 PDF 需要 OCR 识别</li>
          <li>自动检测标题、列表等格式</li>
          <li>复杂排版的 PDF 可能需要手动调整</li>
          <li>所有处理在浏览器本地完成，不上传服务器</li>
        </ul>
      </div>
    </div>
  )
}
