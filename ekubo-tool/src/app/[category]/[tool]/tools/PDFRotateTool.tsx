'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { PDFDocument, degrees } from 'pdf-lib'
import { Download, RotateCw, RotateCcw, FileText } from 'lucide-react'

type RotationDegree = 90 | 180 | 270

export function PDFRotateTool() {
  const [files, setFiles] = useState<File[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [rotation, setRotation] = useState<RotationDegree>(90)
  const [rotateMode, setRotateMode] = useState<'all' | 'selected'>('all')
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    setFiles(newFiles)
    setResult(null)
    setError(null)
    setSelectedPages(new Set())
    
    try {
      const arrayBuffer = await newFiles[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const count = pdfDoc.getPageCount()
      setPageCount(count)
      // 默认选中所有页面
      setSelectedPages(new Set(Array.from({ length: count }, (_, i) => i)))
    } catch {
      setError('无法读取 PDF 文件')
    }
  }

  const handleRotate = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setProgress(30)

      const pages = pdfDoc.getPages()
      const pagesToRotate = rotateMode === 'all' 
        ? Array.from({ length: pages.length }, (_, i) => i)
        : Array.from(selectedPages)

      pagesToRotate.forEach((pageIndex, i) => {
        const page = pages[pageIndex]
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rotation))
        setProgress(30 + ((i + 1) / pagesToRotate.length) * 60)
      })

      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      setResult(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }))
    } catch (err) {
      console.error('Rotate failed:', err)
      setError('PDF 旋转失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = files[0].name.replace('.pdf', '_rotated.pdf')
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setPageCount(0)
    setSelectedPages(new Set())
    setError(null)
  }

  const togglePage = (index: number) => {
    const newSelected = new Set(selectedPages)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedPages(newSelected)
  }

  const selectAll = () => {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i)))
  }

  const selectNone = () => {
    setSelectedPages(new Set())
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
            <label className="block text-sm font-medium mb-3">旋转角度</label>
            <div className="flex gap-2">
              {[
                { value: 90, label: '顺时针 90°', icon: RotateCw },
                { value: 180, label: '180°', icon: RotateCw },
                { value: 270, label: '逆时针 90°', icon: RotateCcw },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setRotation(option.value as RotationDegree)}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    rotation === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">旋转范围</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setRotateMode('all')}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  rotateMode === 'all'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                所有页面
              </button>
              <button
                onClick={() => setRotateMode('selected')}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  rotateMode === 'selected'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                选择页面
              </button>
            </div>

            {rotateMode === 'selected' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>全选</Button>
                  <Button variant="outline" size="sm" onClick={selectNone}>取消全选</Button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => togglePage(i)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        selectedPages.has(i)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">已选择 {selectedPages.size} 页</p>
              </div>
            )}
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button 
              onClick={handleRotate} 
              className="w-full"
              disabled={rotateMode === 'selected' && selectedPages.size === 0}
            >
              旋转 PDF
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-green-800 font-medium mb-4">PDF 旋转完成！</p>
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
