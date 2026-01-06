'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { PDFDocument } from 'pdf-lib'
import { Download, GripVertical, Trash2, FileText } from 'lucide-react'

interface PageItem {
  index: number
  originalIndex: number
  deleted: boolean
}

export function PDFReorderTool() {
  const [files, setFiles] = useState<File[]>([])
  const [pages, setPages] = useState<PageItem[]>([])
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
      const pageCount = pdfDoc.getPageCount()
      setPages(Array.from({ length: pageCount }, (_, i) => ({
        index: i,
        originalIndex: i,
        deleted: false,
      })))
    } catch {
      setError('无法读取 PDF 文件')
    }
  }

  const movePage = (from: number, to: number) => {
    const newPages = [...pages]
    const [removed] = newPages.splice(from, 1)
    newPages.splice(to, 0, removed)
    setPages(newPages)
  }

  const toggleDelete = (index: number) => {
    const newPages = [...pages]
    newPages[index].deleted = !newPages[index].deleted
    setPages(newPages)
  }

  const handleReorder = async () => {
    if (files.length === 0) return

    const activePages = pages.filter(p => !p.deleted)
    if (activePages.length === 0) {
      setError('至少保留一页')
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
      const pageIndices = activePages.map(p => p.originalIndex)
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
      setProgress(70)

      copiedPages.forEach(page => newPdf.addPage(page))
      const pdfBytes = await newPdf.save()
      setProgress(100)

      setResult(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }))
    } catch (err) {
      console.error('Reorder failed:', err)
      setError('页面重排失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = files[0].name.replace('.pdf', '_reordered.pdf')
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setPages([])
    setResult(null)
    setError(null)
  }

  const resetOrder = () => {
    setPages(pages.map((p, i) => ({ ...p, index: i, deleted: false })).sort((a, b) => a.originalIndex - b.originalIndex))
  }

  const activeCount = pages.filter(p => !p.deleted).length

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.pdf']}
        maxSize={100 * 1024 * 1024}
        files={files}
        onFilesSelected={handleFileSelect}
        onRemoveFile={() => { setFiles([]); setPages([]); setResult(null) }}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {pages.length > 0 && !result && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              <FileText className="w-4 h-4 inline mr-1" />
              共 {pages.length} 页，已选择 {activeCount} 页
            </p>
            <Button variant="outline" size="sm" onClick={resetOrder}>
              重置顺序
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
            <p className="text-xs text-gray-500 mb-3">拖拽调整顺序，点击删除按钮移除页面</p>
            <div className="space-y-2">
              {pages.map((page, index) => (
                <div
                  key={page.originalIndex}
                  className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${
                    page.deleted ? 'opacity-50 border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                    page.deleted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {page.originalIndex + 1}
                  </span>
                  <span className="flex-1 text-sm">
                    第 {page.originalIndex + 1} 页
                    {page.deleted && <span className="text-red-500 ml-2">(已删除)</span>}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => movePage(index, index - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === pages.length - 1}
                      onClick={() => movePage(index, index + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDelete(index)}
                      className={page.deleted ? 'text-green-600' : 'text-red-600'}
                    >
                      {page.deleted ? '恢复' : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleReorder} className="w-full" disabled={activeCount === 0}>
              应用更改
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-4">页面重排完成！</p>
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
