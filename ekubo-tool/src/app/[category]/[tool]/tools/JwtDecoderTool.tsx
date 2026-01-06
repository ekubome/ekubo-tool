'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface JwtPayload {
  [key: string]: unknown
  exp?: number
  iat?: number
  nbf?: number
}

export function JwtDecoderTool() {
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const decoded = useMemo(() => {
    if (!token.trim()) return null

    try {
      const parts = token.trim().split('.')
      if (parts.length !== 3) {
        return { error: 'JWT 格式无效，应包含三个部分（header.payload.signature）' }
      }

      const decodeBase64Url = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
        // 使用 TextDecoder 正确处理 UTF-8 编码
        const binaryStr = atob(padded)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }
        const decoded = new TextDecoder('utf-8').decode(bytes)
        return JSON.parse(decoded)
      }

      const header = decodeBase64Url(parts[0])
      const payload = decodeBase64Url(parts[1]) as JwtPayload
      const signature = parts[2]

      // 检查过期时间
      let expStatus: 'valid' | 'expired' | 'unknown' = 'unknown'
      let expDate: Date | null = null
      if (payload.exp) {
        expDate = new Date(payload.exp * 1000)
        expStatus = expDate > new Date() ? 'valid' : 'expired'
      }

      return { header, payload, signature, expStatus, expDate }
    } catch {
      return { error: '无法解析 JWT，请检查格式是否正确' }
    }
  }, [token])

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  const renderJson = (obj: object, title: string, key: string) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{title}</span>
        <Button variant="ghost" size="sm" onClick={() => handleCopy(JSON.stringify(obj, null, 2), key)}>
          {copied === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto">
        {JSON.stringify(obj, null, 2)}
      </pre>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">输入 JWT Token</label>
        <Textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          className="min-h-[120px] font-mono text-sm"
        />
      </div>

      {decoded && 'error' in decoded && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{decoded.error}</p>
        </div>
      )}

      {decoded && !('error' in decoded) && (
        <div className="space-y-6">
          {/* 过期状态 */}
          {decoded.expStatus !== 'unknown' && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              decoded.expStatus === 'valid' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {decoded.expStatus === 'valid' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className={decoded.expStatus === 'valid' ? 'text-green-800' : 'text-red-800'}>
                  {decoded.expStatus === 'valid' ? 'Token 有效' : 'Token 已过期'}
                </p>
                {decoded.expDate && (
                  <p className="text-sm text-gray-600">
                    过期时间: {decoded.expDate.toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Header */}
          {renderJson(decoded.header, 'Header（头部）', 'header')}

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payload（载荷）</span>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'payload')}>
                {copied === 'payload' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
            
            {/* 时间字段解析 */}
            {(decoded.payload.exp || decoded.payload.iat || decoded.payload.nbf) && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                <p className="text-sm font-medium text-blue-800 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 时间字段解析
                </p>
                {decoded.payload.iat && (
                  <p className="text-sm text-blue-700">签发时间 (iat): {formatDate(decoded.payload.iat)}</p>
                )}
                {decoded.payload.exp && (
                  <p className="text-sm text-blue-700">过期时间 (exp): {formatDate(decoded.payload.exp)}</p>
                )}
                {decoded.payload.nbf && (
                  <p className="text-sm text-blue-700">生效时间 (nbf): {formatDate(decoded.payload.nbf)}</p>
                )}
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Signature（签名）</span>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(decoded.signature, 'signature')}>
                {copied === 'signature' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-sm font-mono break-all">
              {decoded.signature}
            </div>
            <p className="text-xs text-gray-500">注意：签名验证需要密钥，此工具仅解码不验证签名</p>
          </div>
        </div>
      )}
    </div>
  )
}
