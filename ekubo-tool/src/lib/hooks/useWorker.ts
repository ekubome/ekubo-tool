'use client'

import { useCallback, useRef, useState } from 'react'

interface UseWorkerOptions<T> {
  onProgress?: (progress: number) => void
  onComplete?: (result: T) => void
  onError?: (error: string) => void
}

export function useWorker<T>(workerFactory: () => Worker, options: UseWorkerOptions<T> = {}) {
  const workerRef = useRef<Worker | null>(null)
  const workerIdRef = useRef<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    setIsProcessing(false)
  }, [])

  const run = useCallback(<M>(message: M): Promise<T> => {
    return new Promise((resolve, reject) => {
      terminate() // 终止之前的 worker

      try {
        // 生成新的 worker ID 以追踪消息
        const currentWorkerId = ++workerIdRef.current
        
        const worker = workerFactory()
        workerRef.current = worker
        setIsProcessing(true)
        setProgress(0)
        setError(null)

        worker.onmessage = (e) => {
          // 只处理当前 worker 的消息，忽略过期的消息
          if (workerIdRef.current !== currentWorkerId) {
            return
          }

          const { type } = e.data

          if (type === 'progress') {
            setProgress(e.data.progress)
            options.onProgress?.(e.data.progress)
          } else if (type === 'result') {
            setIsProcessing(false)
            setProgress(100)
            options.onComplete?.(e.data.data)
            resolve(e.data.data)
            terminate()
          } else if (type === 'error') {
            setIsProcessing(false)
            setError(e.data.message)
            options.onError?.(e.data.message)
            reject(new Error(e.data.message))
            terminate()
          }
        }

        worker.onerror = (e) => {
          // 只处理当前 worker 的错误
          if (workerIdRef.current !== currentWorkerId) {
            return
          }

          const errorMessage = e.message || '处理失败'
          setIsProcessing(false)
          setError(errorMessage)
          options.onError?.(errorMessage)
          reject(new Error(errorMessage))
          terminate()
        }

        worker.postMessage(message)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '创建 Worker 失败'
        setIsProcessing(false)
        setError(errorMessage)
        options.onError?.(errorMessage)
        reject(new Error(errorMessage))
      }
    })
  }, [workerFactory, options, terminate])

  return {
    run,
    terminate,
    isProcessing,
    progress,
    error,
  }
}
