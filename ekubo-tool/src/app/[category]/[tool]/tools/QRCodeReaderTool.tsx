'use client'

import { useState, useRef, useEffect } from 'react'
import { FileUploader } from '@/components/tools/FileUploader'
import { Button } from '@/components/ui/button'
import { Copy, Check, Camera, Upload } from 'lucide-react'
import jsQR from 'jsqr'

export function QRCodeReaderTool() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // 组件卸载时清理摄像头
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const decodeFromFile = async (file: File) => {
    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = url
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas error')

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      URL.revokeObjectURL(url)

      if (code) {
        setResult(code.data)
      } else {
        setError('未能识别到二维码，请确保图片清晰且包含有效的二维码')
      }
    } catch {
      setError('图片处理失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleFileSelect = (newFiles: File[]) => {
    setFiles(newFiles)
    if (newFiles.length > 0) {
      decodeFromFile(newFiles[0])
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setUseCamera(true)
      scanCamera()
    } catch {
      setError('无法访问摄像头')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setUseCamera(false)
  }

  const scanCamera = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scan = () => {
      if (!streamRef.current) return
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          setResult(code.data)
          stopCamera()
          return
        }
      }
      requestAnimationFrame(scan)
    }
    scan()
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setError(null)
    stopCamera()
  }

  const isUrl = (str: string) => {
    try { new URL(str); return true } catch { return false }
  }

  return (
    <div className="space-y-6">
      {!useCamera && !result && (
        <>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />上传图片
            </Button>
            <Button variant="outline" onClick={startCamera} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />使用摄像头
            </Button>
          </div>

          <FileUploader
            accept={['.jpg', '.jpeg', '.png', '.webp']}
            maxSize={10 * 1024 * 1024}
            files={files}
            onFilesSelected={handleFileSelect}
            onRemoveFile={() => { setFiles([]); setResult(null); setError(null) }}
          />
        </>
      )}

      {useCamera && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} className="w-full" playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/50 rounded-lg" />
            </div>
          </div>
          <Button variant="outline" onClick={stopCamera} className="w-full">取消扫描</Button>
        </div>
      )}

      {processing && (
        <div className="p-4 bg-blue-50 rounded-xl text-center">
          <p className="text-blue-800">正在识别二维码...</p>
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-800 font-medium mb-3">识别成功！</p>
            <div className="p-4 bg-white rounded-lg border break-all">
              {isUrl(result) ? (
                <a href={result} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result}</a>
              ) : (
                <p className="text-gray-800">{result}</p>
              )}
            </div>
            <Button onClick={handleCopy} variant="outline" className="mt-4">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? '已复制' : '复制内容'}
            </Button>
          </div>
          <Button variant="outline" onClick={handleReset} className="w-full">识别其他二维码</Button>
        </div>
      )}
    </div>
  )
}
