'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ResultDownload } from '@/components/tools/ResultDownload'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { convertImage } from '@/lib/tools/image/convert'

const FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
]

export function ImageConvertTool() {
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('webp')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{ blob: Blob; filename: string; originalSize: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setResults([])
    setError(null)

    const newResults: typeof results = []

    for (const file of files) {
      try {
        const blob = await convertImage(file, { format })
        const ext = format === 'jpeg' ? 'jpg' : format
        newResults.push({
          blob,
          filename: file.name.replace(/\.[^.]+$/, `.${ext}`),
          originalSize: file.size,
        })
      } catch (err) {
        console.error('Conversion failed:', err)
        setError(`转换 ${file.name} 失败`)
      }
    }

    setResults(newResults)
    setProcessing(false)
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.jpg', '.jpeg', '.png', '.webp']}
        maxSize={20 * 1024 * 1024}
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

      {files.length > 0 && results.length === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">输出格式</label>
            <Select
              options={FORMAT_OPTIONS}
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
            />
          </div>

          <Button onClick={handleProcess} disabled={processing} className="w-full">
            {processing ? '转换中...' : '开始转换'}
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultDownload
              key={index}
              blob={result.blob}
              filename={result.filename}
              originalSize={result.originalSize}
            />
          ))}
          <Button variant="outline" onClick={handleReset} className="w-full">
            处理更多文件
          </Button>
        </div>
      )}
    </div>
  )
}
