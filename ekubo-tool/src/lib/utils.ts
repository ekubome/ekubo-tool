import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 0) return '无效大小'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getCompressionRatio(original: number, compressed: number): string {
  if (original === 0) return '无法计算'
  if (original < 0 || compressed < 0) return '无效数据'
  const ratio = ((original - compressed) / original * 100).toFixed(1)
  return `${ratio}%`
}
