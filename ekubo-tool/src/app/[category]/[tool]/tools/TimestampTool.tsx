'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentTimestamp, timestampToDate, dateToTimestamp, type TimestampResult } from '@/lib/tools/dev/timestamp'
import { Copy, RefreshCw } from 'lucide-react'

export function TimestampTool() {
  const [currentTime, setCurrentTime] = useState<TimestampResult | null>(null)
  const [timestampInput, setTimestampInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [result, setResult] = useState<TimestampResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setCurrentTime(getCurrentTimestamp())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTimestampConvert = () => {
    try {
      const ts = parseInt(timestampInput)
      if (isNaN(ts)) throw new Error('请输入有效的时间戳')
      setResult(timestampToDate(ts))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleDateConvert = () => {
    try {
      setResult(dateToTimestamp(dateInput))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Current Time */}
      {currentTime && (
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">当前时间戳</span>
            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold">{currentTime.timestamp}</span>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(String(currentTime.timestamp))}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{currentTime.local}</p>
        </div>
      )}

      {/* Timestamp to Date */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">时间戳转日期</label>
        <div className="flex gap-2">
          <Input
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="输入时间戳 (秒或毫秒)"
          />
          <Button onClick={handleTimestampConvert}>转换</Button>
        </div>
      </div>

      {/* Date to Timestamp */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">日期转时间戳</label>
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          <Button onClick={handleDateConvert}>转换</Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-50 rounded-xl space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">时间戳 (秒)</span>
            <span className="font-mono">{result.timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">时间戳 (毫秒)</span>
            <span className="font-mono">{result.timestampMs}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">本地时间</span>
            <span>{result.local}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">UTC 时间</span>
            <span className="text-sm">{result.utc}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ISO 格式</span>
            <span className="font-mono text-sm">{result.iso}</span>
          </div>
        </div>
      )}

      {/* 时区说明 */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p>注意：本地时间基于您的浏览器时区 ({Intl.DateTimeFormat().resolvedOptions().timeZone})，时间戳为 UTC 标准时间。</p>
      </div>
    </div>
  )
}
