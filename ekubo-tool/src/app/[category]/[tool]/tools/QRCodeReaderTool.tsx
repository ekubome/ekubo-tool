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
  const [cameraLoading, setCameraLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  // 组件卸载时清理摄像头
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
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
    console.log('=== startCamera 被调用 ===')
    
    try {
      setError(null)
      setCameraLoading(true)
      setUseCamera(true)
      
      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('videoRef.current:', videoRef.current)
      
      if (!videoRef.current) {
        throw new Error('视频元素未找到')
      }

      // 检查是否支持 getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持摄像头功能')
      }

      console.log('正在请求摄像头权限...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('摄像头权限已获取')
      console.log('视频轨道:', stream.getVideoTracks())
      console.log('轨道设置:', stream.getVideoTracks()[0]?.getSettings())
      
      streamRef.current = stream
      
      const video = videoRef.current
      video.srcObject = stream
      
      console.log('已设置 srcObject，等待视频加载...')
      
      // 等待视频可以播放
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.log('超时！当前 video 状态:', {
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            paused: video.paused
          })
          reject(new Error('摄像头启动超时，请刷新页面重试'))
        }, 15000)
        
        const handleCanPlay = () => {
          clearTimeout(timeoutId)
          video.removeEventListener('canplay', handleCanPlay)
          console.log('视频 canplay 事件触发')
          console.log('视频尺寸:', video.videoWidth, 'x', video.videoHeight)
          resolve()
        }
        
        video.addEventListener('canplay', handleCanPlay)
        
        // 如果视频已经准备好了
        if (video.readyState >= 3) {
          clearTimeout(timeoutId)
          video.removeEventListener('canplay', handleCanPlay)
          console.log('视频已经准备好')
          resolve()
          return
        }
        
        video.play().then(() => {
          console.log('video.play() 成功')
        }).catch(err => {
          console.error('video.play() 失败:', err)
          clearTimeout(timeoutId)
          reject(err)
        })
      })
      
      setCameraLoading(false)
      console.log('开始扫描二维码...')
      scanCamera()
      
    } catch (err) {
      console.error('摄像头错误:', err)
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      setCameraLoading(false)
      setUseCamera(false)
      
      // 更详细的错误提示
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('摄像头权限被拒绝，请在浏览器设置中允许访问摄像头')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('未找到摄像头设备')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('摄像头被其他应用占用，请关闭其他使用摄像头的应用')
        } else if (err.name === 'OverconstrainedError') {
          setError('摄像头不支持请求的分辨率')
        } else {
          setError(`摄像头错误: ${err.message}`)
        }
      } else {
        setError('无法访问摄像头，请确保使用 HTTPS 或 localhost 访问')
      }
    }
  }

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setUseCamera(false)
    setCameraLoading(false)
  }

  const scanCamera = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scan = () => {
      if (!streamRef.current || !videoRef.current) return
      
      // 确保视频已经准备好并且有有效的尺寸
      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })
          
          if (code) {
            console.log('识别到二维码:', code.data)
            setResult(code.data)
            stopCamera()
            return
          }
        } catch (err) {
          console.error('QR scan error:', err)
        }
      }
      
      // 继续扫描
      if (streamRef.current) {
        animationRef.current = requestAnimationFrame(scan)
      }
    }
    
    animationRef.current = requestAnimationFrame(scan)
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
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
            {cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">正在启动摄像头...</p>
                </div>
              </div>
            )}
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline 
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />
            {/* 扫描框 */}
            {!cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-lg" />
                  {/* 四个角 */}
                  <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  {/* 扫描线动画 */}
                  <div className="absolute left-1 right-1 h-0.5 bg-blue-400 animate-pulse" style={{ top: '50%' }} />
                </div>
              </div>
            )}
            {!cameraLoading && (
              <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
                将二维码对准框内
              </p>
            )}
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
