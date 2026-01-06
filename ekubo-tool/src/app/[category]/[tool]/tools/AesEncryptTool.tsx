'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Copy, Check, Eye, EyeOff, RefreshCw } from 'lucide-react'
import CryptoJS from 'crypto-js'

type Mode = 'encrypt' | 'decrypt'

export function AesEncryptTool() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const generateKey = () => {
    // 使用 crypto API 生成更安全的随机密钥
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(array[i] % chars.length)
    }
    setKey(result)
  }

  const handleProcess = () => {
    setError(null)
    setOutput('')

    if (!input.trim()) {
      setError('请输入要处理的内容')
      return
    }
    if (!key.trim()) {
      setError('请输入密钥')
      return
    }

    try {
      if (mode === 'encrypt') {
        const encrypted = CryptoJS.AES.encrypt(input, key).toString()
        setOutput(encrypted)
      } else {
        const decrypted = CryptoJS.AES.decrypt(input, key)
        const result = decrypted.toString(CryptoJS.enc.Utf8)
        if (!result) {
          throw new Error('解密失败，请检查密钥是否正确')
        }
        setOutput(result)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '处理失败')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('encrypt'); setOutput(''); setError(null) }}
          className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
            mode === 'encrypt' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          加密
        </button>
        <button
          onClick={() => { setMode('decrypt'); setOutput(''); setError(null) }}
          className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
            mode === 'decrypt' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          解密
        </button>
      </div>

      {/* 输入 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {mode === 'encrypt' ? '明文' : '密文'}
        </label>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={mode === 'encrypt' ? '输入要加密的内容...' : '输入要解密的内容...'}
          className="min-h-[150px] font-mono text-sm"
        />
      </div>

      {/* 密钥 */}
      <div>
        <label className="block text-sm font-medium mb-2">密钥</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="输入密钥..."
              className="pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button variant="outline" onClick={generateKey} title="生成随机密钥">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">建议使用 16、24 或 32 位字符作为密钥</p>
      </div>

      <Button onClick={handleProcess} className="w-full" disabled={!input.trim() || !key.trim()}>
        {mode === 'encrypt' ? '加密' : '解密'}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">
              {mode === 'encrypt' ? '密文' : '明文'}
            </label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea value={output} readOnly className="min-h-[150px] font-mono text-sm bg-gray-50" />
        </div>
      )}

      {/* 说明 */}
      <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
        <p className="font-medium mb-1">使用说明</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>使用 AES-256 加密算法</li>
          <li>加密结果为 Base64 编码</li>
          <li>请妥善保管密钥，丢失后无法解密</li>
          <li>相同内容和密钥每次加密结果可能不同（使用随机 IV）</li>
        </ul>
      </div>
    </div>
  )
}
