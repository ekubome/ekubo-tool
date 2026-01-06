'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { ResultDownload } from '@/components/tools/ResultDownload'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { PDFDocument } from 'pdf-lib'

const QUALITY_OPTIONS = [
  { value: 'low', label: '高压缩 (文件最小)' },
  { value: 'medium', label: '平衡 (推荐)' },
  { value: 'high', label: '高质量 (文件较大)' },
]

// 注意：pdf-lib 的压缩能力有限，主要通过对象流优化来减小文件大小
// 对于包含大量图片的 PDF，压缩效果可能不明显

export function PDFCompressTool() {
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState('medium')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ blob: Blob; filename: string; originalSize: number } | null>(null)

  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      setProgress(30)

      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setProgress(60)

      // 根据质量设置压缩参数
      const saveOptions: { useObjectStreams?: boolean } = {}
      if (quality === 'low') {
        saveOptions.useObjectStreams = true
      }

      const compressedBytes = await pdfDoc.save(saveOptions)
      setProgress(90)

      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' })
      
      setResult({
        blob,
        filename: file.name.replace('.pdf', '_compressed.pdf'),
        originalSize: file.size,
      })
      setProgress(100)
    } catch (error) {
      console.error('Compression failed:', error)
      setError('PDF 压缩失败，请检查文件是否有效')
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setProgress(0)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.pdf']}
        maxSize={100 * 1024 * 1024}
        files={files}
        onFilesSelected={(newFiles) => setFiles(newFiles)}
        onRemoveFile={() => setFiles([])}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && !result && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">压缩质量</label>
            <Select
              options={QUALITY_OPTIONS}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleProcess} className="w-full">
              开始压缩
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <ResultDownload
            blob={result.blob}
            filename={result.filename}
            originalSize={result.originalSize}
          />
          {result.blob.size >= result.originalSize * 0.95 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
              💡 提示：该 PDF 可能已经过优化，或包含大量图片。对于图片密集型 PDF，建议使用专业的 PDF 压缩软件。
            </div>
          )}
          <Button variant="outline" onClick={handleReset} className="w-full">
            处理更多文件
          </Button>
        </div>
      )}
    </div>
  )
}
