'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PDFDocument } from 'pdf-lib'
import { Download, FileText } from 'lucide-react'
import JSZip from 'jszip'

export function PDFSplitTool() {
  const [files, setFiles] = useState<File[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [splitMode, setSplitMode] = useState<'each' | 'range' | 'fixed'>('each')
  const [rangeInput, setRangeInput] = useState('')
  const [fixedPages, setFixedPages] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    setFiles(newFiles)
    setResults([])
    setError(null)
    
    try {
      const arrayBuffer = await newFiles[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())
    } catch {
      setError('无法读取 PDF 文件')
    }
  }

  const handleSplit = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()
      const baseName = file.name.replace('.pdf', '')
      const splitResults: { name: string; blob: Blob }[] = []

      if (splitMode === 'each') {
        // 每页拆分为一个文件
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create()
          const [page] = await newPdf.copyPages(pdfDoc, [i])
          newPdf.addPage(page)
          const pdfBytes = await newPdf.save()
          splitResults.push({
            name: `${baseName}_page_${i + 1}.pdf`,
            blob: new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
          })
          setProgress(((i + 1) / totalPages) * 100)
        }
      } else if (splitMode === 'range') {
        // 按范围拆分
        const ranges = parseRanges(rangeInput, totalPages)
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i]
          const newPdf = await PDFDocument.create()
          const pageIndices = []
          for (let j = range.start - 1; j < range.end; j++) {
            pageIndices.push(j)
          }
          const pages = await newPdf.copyPages(pdfDoc, pageIndices)
          pages.forEach(page => newPdf.addPage(page))
          const pdfBytes = await newPdf.save()
          splitResults.push({
            name: `${baseName}_${range.start}-${range.end}.pdf`,
            blob: new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
          })
          setProgress(((i + 1) / ranges.length) * 100)
        }
      } else if (splitMode === 'fixed') {
        // 固定页数拆分
        const chunks = Math.ceil(totalPages / fixedPages)
        for (let i = 0; i < chunks; i++) {
          const newPdf = await PDFDocument.create()
          const start = i * fixedPages
          const end = Math.min(start + fixedPages, totalPages)
          const pageIndices = []
          for (let j = start; j < end; j++) {
            pageIndices.push(j)
          }
          const pages = await newPdf.copyPages(pdfDoc, pageIndices)
          pages.forEach(page => newPdf.addPage(page))
          const pdfBytes = await newPdf.save()
          splitResults.push({
            name: `${baseName}_part_${i + 1}.pdf`,
            blob: new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
          })
          setProgress(((i + 1) / chunks) * 100)
        }
      }

      setResults(splitResults)
    } catch (err) {
      console.error('Split failed:', err)
      setError('PDF 拆分失败')
    } finally {
      setProcessing(false)
    }
  }

  const parseRanges = (input: string, max: number): { start: number; end: number }[] => {
    const ranges: { start: number; end: number }[] = []
    const parts = input.split(',').map(s => s.trim())
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()))
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= max && start <= end) {
          ranges.push({ start, end })
        }
      } else {
        const page = parseInt(part)
        if (!isNaN(page) && page >= 1 && page <= max) {
          ranges.push({ start: page, end: page })
        }
      }
    }
    return ranges
  }

  const handleDownloadAll = async () => {
    if (results.length === 0) return
    
    const zip = new JSZip()
    results.forEach(result => {
      zip.file(result.name, result.blob)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'split_pdfs.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadSingle = (result: { name: string; blob: Blob }) => {
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setPageCount(0)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.pdf']}
        maxSize={100 * 1024 * 1024}
        files={files}
        onFilesSelected={handleFileSelect}
        onRemoveFile={() => { setFiles([]); setPageCount(0); setResults([]) }}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {pageCount > 0 && results.length === 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <FileText className="w-4 h-4 inline mr-1" />
              该 PDF 共 <strong>{pageCount}</strong> 页
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">拆分方式</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'each', label: '每页一个文件' },
                { value: 'range', label: '按范围拆分' },
                { value: 'fixed', label: '固定页数' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSplitMode(option.value as typeof splitMode)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    splitMode === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {splitMode === 'range' && (
            <div>
              <label className="block text-sm font-medium mb-2">页面范围</label>
              <Input
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="例如: 1-3, 5, 7-10"
              />
              <p className="text-xs text-gray-500 mt-1">用逗号分隔多个范围</p>
            </div>
          )}

          {splitMode === 'fixed' && (
            <div>
              <label className="block text-sm font-medium mb-2">每份页数</label>
              <Input
                type="number"
                value={fixedPages}
                onChange={(e) => setFixedPages(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={pageCount}
              />
            </div>
          )}

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleSplit} className="w-full">
              开始拆分
            </Button>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">已拆分为 {results.length} 个文件</span>
            <Button onClick={handleDownloadAll} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              下载全部 (ZIP)
            </Button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm truncate flex-1">{result.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadSingle(result)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={handleReset} className="w-full">
            处理其他文件
          </Button>
        </div>
      )}
    </div>
  )
}
