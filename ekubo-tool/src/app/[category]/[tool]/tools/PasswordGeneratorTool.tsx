'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { generatePassword, calculatePasswordStrength } from '@/lib/tools/crypto/password'
import { Copy, Check, RefreshCw } from 'lucide-react'

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    // 确保至少选择了一种字符类型
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
      setPassword(generatePassword({ length, lowercase: true, numbers: true, uppercase: false, symbols: false }))
    } else {
      setPassword(generatePassword({ length, ...options }))
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = password ? calculatePasswordStrength(password) : null

  const strengthColors = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  }

  return (
    <div className="space-y-6">
      {/* Password Display */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <Input
            value={password}
            readOnly
            placeholder="点击生成密码"
            className="font-mono text-lg bg-white"
          />
          <Button variant="outline" size="icon" onClick={handleCopy} disabled={!password}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button size="icon" onClick={handleGenerate}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {strength && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">密码强度</span>
              <span className={`font-medium text-${strength.color}-600`}>{strength.label}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${strengthColors[strength.color as keyof typeof strengthColors]}`}
                style={{ width: `${(strength.score / 7) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-4">
        <Slider
          label="密码长度"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          min={8}
          max={64}
        />

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'uppercase', label: '大写字母 (A-Z)' },
            { key: 'lowercase', label: '小写字母 (a-z)' },
            { key: 'numbers', label: '数字 (0-9)' },
            { key: 'symbols', label: '特殊字符 (!@#$...)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={options[key as keyof typeof options]}
                onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full">
        生成密码
      </Button>
    </div>
  )
}
