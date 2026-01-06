'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { Button } from '@/components/ui/button'
import { mergePDFs } from '@/lib/tools/pdf/merge'
import { Download, GripVertical } from 'lucide-react'

export function PDFMergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (files.length < 2) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const mergedPdf = await mergePDFs(files, setProgress)
      setResult(mergedPdf)
    } catch (err) {
      console.error('Merge failed:', err)
      setError('PDF 合并失败，请检查文件是否有效')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setProgress(0)
    setError(null)
  }

  const moveFile = (from: number, to: number) => {
    const newFiles = [...files]
    const [removed] = newFiles.splice(from, 1)
    newFiles.splice(to, 0, removed)
    setFiles(newFiles)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.pdf']}
        maxSize={50 * 1024 * 1024}
        multiple
        files={files}
        onFilesSelected={(newFiles) => { setFiles([...files, ...newFiles]); setError(null) }}
        onRemoveFile={(index) => setFiles(files.filter((_, i) => i !== index))}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {files.length > 1 && !result && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-3">拖拽调整顺序（上方文件在前）</p>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 p-2 bg-white rounded border"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveFile(index, index - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === files.length - 1}
                      onClick={() => moveFile(index, index + 1)}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleProcess} className="w-full">
              合并 PDF ({files.length} 个文件)
            </Button>
          )}
        </div>
      )}

      {files.length === 1 && (
        <p className="text-center text-gray-500 text-sm">请至少选择 2 个 PDF 文件</p>
      )}

      {result && (
        <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
          <p className="text-green-800 font-medium mb-4">PDF 合并完成！</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              下载合并后的 PDF
            </Button>
            <Button variant="outline" onClick={handleReset}>
              处理更多文件
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
