'use client'

import { Download, Check, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize, getCompressionRatio } from '@/lib/utils'

interface ResultDownloadProps {
  blob: Blob
  filename: string
  originalSize: number
}

export function ResultDownload({ blob, filename, originalSize }: ResultDownloadProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const compressionRatio = getCompressionRatio(originalSize, blob.size)
  const isSmaller = blob.size < originalSize
  const savedBytes = originalSize - blob.size
  const compressionPercent = ((originalSize - blob.size) / originalSize) * 100

  // 如果文件变大了或压缩效果很差，显示提示
  const showWarning = !isSmaller || compressionPercent < 5

  return (
    <div className={`p-6 rounded-2xl border ${
      showWarning 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
    }`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-full ${showWarning ? 'bg-yellow-500' : 'bg-green-500'}`}>
          {showWarning ? (
            <AlertCircle className="w-5 h-5 text-white" />
          ) : (
            <Check className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <span className={`font-semibold ${showWarning ? 'text-yellow-800' : 'text-green-800'}`}>
            处理完成
          </span>
          {isSmaller && compressionPercent >= 5 ? (
            <p className="text-sm text-green-600">节省了 {formatFileSize(savedBytes)}</p>
          ) : isSmaller ? (
            <p className="text-sm text-yellow-600">压缩效果有限，可能文件已经过优化</p>
          ) : (
            <p className="text-sm text-yellow-600">文件大小未减小，原文件可能已是最优</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">原始大小</p>
          <p className="font-semibold text-gray-900">{formatFileSize(originalSize)}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">处理后</p>
          <p className="font-semibold text-gray-900">{formatFileSize(blob.size)}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">{isSmaller ? '压缩率' : '变化'}</p>
          <p className={`font-semibold flex items-center justify-center gap-1 ${isSmaller ? 'text-green-600' : 'text-orange-600'}`}>
            {isSmaller ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {compressionRatio}
          </p>
        </div>
      </div>

      <Button 
        onClick={handleDownload} 
        className={`w-full ${showWarning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
      >
        <Download className="w-4 h-4 mr-2" />
        下载文件
      </Button>
    </div>
  )
}
