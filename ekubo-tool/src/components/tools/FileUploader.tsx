'use client'

import { useCallback, useState } from 'react'
import { Upload, X, File, Image, FileText, AlertTriangle } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploaderProps {
  accept: string[]
  maxSize: number
  multiple?: boolean
  onFilesSelected: (files: File[]) => void
  files: File[]
  onRemoveFile: (index: number) => void
}

function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) return Image
  if (file.type === 'application/pdf') return FileText
  return File
}

// 大文件警告阈值
const LARGE_FILE_WARNING = 10 * 1024 * 1024 // 10MB

export function FileUploader({
  accept,
  maxSize,
  multiple = false,
  onFilesSelected,
  files,
  onRemoveFile,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const validateFiles = useCallback((fileList: FileList | File[]): File[] => {
    const validFiles: File[] = []
    const filesArray = Array.from(fileList)
    let hasLargeFile = false

    for (const file of filesArray) {
      if (maxSize > 0 && file.size > maxSize) {
        setError(`文件 ${file.name} 超过大小限制 (${formatFileSize(maxSize)})`)
        continue
      }
      if (file.size > LARGE_FILE_WARNING) {
        hasLargeFile = true
      }
      validFiles.push(file)
    }

    if (hasLargeFile) {
      setWarning('文件较大，处理可能需要较长时间，请耐心等待')
    } else {
      setWarning(null)
    }

    return validFiles
  }, [maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const validFiles = validateFiles(e.dataTransfer.files)
    if (validFiles.length > 0) {
      onFilesSelected(multiple ? validFiles : [validFiles[0]])
    }
  }, [validateFiles, onFilesSelected, multiple])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files) {
      const validFiles = validateFiles(e.target.files)
      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]])
      }
    }
    e.target.value = ''
  }, [validateFiles, onFilesSelected, multiple])

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group",
          isDragging 
            ? "border-blue-500 bg-blue-50 scale-[1.02]" 
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
          error && "border-red-300 bg-red-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleFileInput}
        />
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300",
          isDragging 
            ? "bg-blue-500 text-white scale-110" 
            : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500"
        )}>
          <Upload className="w-8 h-8" />
        </div>
        <p className="text-gray-700 font-medium mb-2">
          拖拽文件到这里，或 <span className="text-blue-600">点击选择</span>
        </p>
        <p className="text-sm text-gray-400">
          {accept.length > 0 ? `支持 ${accept.filter(a => a.startsWith('.')).join(', ')} 格式` : '支持所有格式'}
          {maxSize > 0 && ` · 最大 ${formatFileSize(maxSize)}`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {warning && !error && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {warning}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const FileIcon = getFileIcon(file)
            const isLarge = file.size > LARGE_FILE_WARNING
            return (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border group transition-colors",
                  isLarge 
                    ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" 
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-lg border">
                    <FileIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className={cn("text-xs", isLarge ? "text-yellow-600" : "text-gray-400")}>
                      {formatFileSize(file.size)}
                      {isLarge && " · 大文件"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(index) }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
