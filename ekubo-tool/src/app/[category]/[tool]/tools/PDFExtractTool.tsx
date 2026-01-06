'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PDFDocument } from 'pdf-lib'
import { Download, FileText } from 'lucide-react'

export function PDFExtractTool() {
  const [files, setFiles] = useState<File[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [pageInput, setPageInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    setFiles(newFiles)
    setResult(null)
    setError(null)
    
    try {
      const arrayBuffer = await newFiles[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())
    } catch {
      setError('无法读取 PDF 文件')
    }
  }

  const parsePages = (input: string, max: number): number[] => {
    const pages: Set<number> = new Set()
    const parts = input.split(',').map(s => s.trim())
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()))
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
            pages.add(i)
          }
        }
      } else {
        const page = parseInt(part)
        if (!isNaN(page) && page >= 1 && page <= max) {
          pages.add(page)
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const handleExtract = async () => {
    if (files.length === 0 || !pageInput.trim()) return

    const pages = parsePages(pageInput, pageCount)
    if (pages.length === 0) {
      setError('请输入有效的页码')
      return
    }

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setProgress(30)

      const newPdf = await PDFDocument.create()
      const pageIndices = pages.map(p => p - 1)
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
      setProgress(70)

      copiedPages.forEach(page => newPdf.addPage(page))
      const pdfBytes = await newPdf.save()
      setProgress(100)

      setResult(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }))
    } catch (err) {
      console.error('Extract failed:', err)
      setError('页面提取失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = files[0].name.replace('.pdf', '_extracted.pdf')
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setPageCount(0)
    setPageInput('')
    setError(null)
  }

  const quickSelect = (type: 'odd' | 'even' | 'first' | 'last') => {
    if (pageCount === 0) return
    
    let pages: number[] = []
    switch (type) {
      case 'odd':
        for (let i = 1; i <= pageCount; i += 2) pages.push(i)
        break
      case 'even':
        for (let i = 2; i <= pageCount; i += 2) pages.push(i)
        break
      case 'first':
        pages = [1]
        break
      case 'last':
        pages = [pageCount]
        break
    }
    setPageInput(pages.join(', '))
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.pdf']}
        maxSize={100 * 1024 * 1024}
        files={files}
        onFilesSelected={handleFileSelect}
        onRemoveFile={() => { setFiles([]); setPageCount(0); setResult(null) }}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {pageCount > 0 && !result && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <FileText className="w-4 h-4 inline mr-1" />
              该 PDF 共 <strong>{pageCount}</strong> 页
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">要提取的页码</label>
            <Input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="例如: 1, 3, 5-10, 15"
            />
            <p className="text-xs text-gray-500 mt-1">用逗号分隔，支持范围（如 1-5）</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">快速选择</label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => quickSelect('odd')}>
                奇数页
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickSelect('even')}>
                偶数页
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickSelect('first')}>
                第一页
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickSelect('last')}>
                最后一页
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPageInput(`1-${pageCount}`)}>
                全部页面
              </Button>
            </div>
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleExtract} className="w-full" disabled={!pageInput.trim()}>
              提取页面
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-4">页面提取完成！</p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              下载 PDF
            </Button>
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">
            处理其他文件
          </Button>
        </div>
      )}
    </div>
  )
}
