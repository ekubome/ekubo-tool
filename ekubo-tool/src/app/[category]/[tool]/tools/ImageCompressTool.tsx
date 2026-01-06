'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { ProgressBar } from '@/components/tools/ProgressBar'
import { ResultDownload } from '@/components/tools/ResultDownload'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { compressImage } from '@/lib/tools/image/compress'

export function ImageCompressTool() {
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState(80)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ blob: Blob; filename: string; originalSize: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress(0)
    setResults([])
    setError(null)

    const newResults: typeof results = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const blob = await compressImage(file, { quality }, (p) => {
          setProgress(((i + p / 100) / files.length) * 100)
        })
        
        // 正确处理文件名：在扩展名前添加 _compressed
        const lastDotIndex = file.name.lastIndexOf('.')
        const newFilename = lastDotIndex > 0
          ? file.name.slice(0, lastDotIndex) + '_compressed' + file.name.slice(lastDotIndex)
          : file.name + '_compressed'
        
        newResults.push({
          blob,
          filename: newFilename,
          originalSize: file.size,
        })
      } catch (err) {
        console.error('Compression failed:', err)
        setError(`压缩 ${file.name} 失败`)
      }
    }

    setResults(newResults)
    setProcessing(false)
    setProgress(100)
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setProgress(0)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FileUploader
        accept={['.jpg', '.jpeg', '.png', '.webp']}
        maxSize={20 * 1024 * 1024}
        multiple
        files={files}
        onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
        onRemoveFile={(index) => setFiles(files.filter((_, i) => i !== index))}
      />

      {files.length > 0 && results.length === 0 && (
        <div className="space-y-4">
          <Slider
            label="压缩质量"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            min={1}
            max={100}
          />

          {processing ? (
            <ProgressBar progress={progress} />
          ) : (
            <Button onClick={handleProcess} className="w-full">
              开始压缩
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
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
