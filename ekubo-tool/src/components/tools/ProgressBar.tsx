'use client'

import { cn } from '@/lib/utils'
import { Loader2, AlertTriangle } from 'lucide-react'

interface ProgressBarProps {
  progress: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ progress, className, showLabel = true }: ProgressBarProps) {
  const isSlowProgress = progress > 0 && progress < 30

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            处理中，请勿关闭页面...
          </span>
          <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {isSlowProgress && (
        <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          大文件处理较慢，请耐心等待
        </p>
      )}
    </div>
  )
}
