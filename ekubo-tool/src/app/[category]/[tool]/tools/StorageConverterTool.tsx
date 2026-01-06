'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Unit {
  name: string
  symbol: string
  toBytes: number
}

// 使用二进制单位 (1024) 和十进制单位 (1000)
const BINARY_UNITS: Unit[] = [
  { name: '字节', symbol: 'B', toBytes: 1 },
  { name: '千字节', symbol: 'KiB', toBytes: 1024 },
  { name: '兆字节', symbol: 'MiB', toBytes: 1024 ** 2 },
  { name: '吉字节', symbol: 'GiB', toBytes: 1024 ** 3 },
  { name: '太字节', symbol: 'TiB', toBytes: 1024 ** 4 },
  { name: '拍字节', symbol: 'PiB', toBytes: 1024 ** 5 },
]

const DECIMAL_UNITS: Unit[] = [
  { name: '字节', symbol: 'B', toBytes: 1 },
  { name: '千字节', symbol: 'KB', toBytes: 1000 },
  { name: '兆字节', symbol: 'MB', toBytes: 1000 ** 2 },
  { name: '吉字节', symbol: 'GB', toBytes: 1000 ** 3 },
  { name: '太字节', symbol: 'TB', toBytes: 1000 ** 4 },
  { name: '拍字节', symbol: 'PB', toBytes: 1000 ** 5 },
]

const BIT_UNITS: Unit[] = [
  { name: '比特', symbol: 'bit', toBytes: 0.125 },
  { name: '千比特', symbol: 'Kbit', toBytes: 125 },
  { name: '兆比特', symbol: 'Mbit', toBytes: 125000 },
  { name: '吉比特', symbol: 'Gbit', toBytes: 125000000 },
]

export function StorageConverterTool() {
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('GB')
  const [copied, setCopied] = useState<string | null>(null)

  const results = useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const allUnitsWithB = [...DECIMAL_UNITS, ...BINARY_UNITS.slice(1), ...BIT_UNITS]
    const fromUnitData = allUnitsWithB.find(u => u.symbol === fromUnit)
    if (!fromUnitData) return null

    const bytes = num * fromUnitData.toBytes

    return {
      binary: BINARY_UNITS.map(unit => ({
        ...unit,
        value: bytes / unit.toBytes,
      })),
      decimal: DECIMAL_UNITS.map(unit => ({
        ...unit,
        value: bytes / unit.toBytes,
      })),
      bits: BIT_UNITS.map(unit => ({
        ...unit,
        value: bytes / unit.toBytes,
      })),
      bytes,
    }
  }, [value, fromUnit])

  const handleCopy = async (val: number, symbol: string) => {
    await navigator.clipboard.writeText(val.toString())
    setCopied(symbol)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatNumber = (num: number): string => {
    if (num === 0) return '0'
    if (Math.abs(num) >= 1e15) return num.toExponential(4)
    if (num >= 1000000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
    if (num >= 1) return num.toLocaleString('en-US', { maximumFractionDigits: 4 })
    return num.toPrecision(6)
  }

  const renderUnitGroup = (title: string, units: Array<Unit & { value: number }>, description: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {units.map(result => (
          <div
            key={result.symbol}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              result.symbol === fromUnit ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="text-xs text-gray-500">{result.name}</span>
              <p className="font-mono text-sm font-medium truncate">
                {formatNumber(result.value)} <span className="text-gray-400">{result.symbol}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 flex-shrink-0"
              onClick={() => handleCopy(result.value, result.symbol)}
            >
              {copied === result.symbol ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">输入数值</label>
          <Input
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="输入要转换的数值"
            className="text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">单位</label>
          <select
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
            className="w-full h-10 px-3 border rounded-lg"
          >
            <optgroup label="十进制 (1000)">
              {DECIMAL_UNITS.map(unit => (
                <option key={unit.symbol} value={unit.symbol}>{unit.symbol}</option>
              ))}
            </optgroup>
            <optgroup label="二进制 (1024)">
              {BINARY_UNITS.slice(1).map(unit => (
                <option key={unit.symbol} value={unit.symbol}>{unit.symbol}</option>
              ))}
            </optgroup>
            <optgroup label="比特">
              {BIT_UNITS.map(unit => (
                <option key={unit.symbol} value={unit.symbol}>{unit.symbol}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {results && (
        <div className="space-y-4">
          {/* 字节数显示 */}
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-blue-600">总字节数</p>
            <p className="text-2xl font-mono font-bold text-blue-800">
              {results.bytes.toLocaleString('en-US')} B
            </p>
          </div>

          {renderUnitGroup('十进制单位', results.decimal, '硬盘厂商常用 (1KB = 1000B)')}
          {renderUnitGroup('二进制单位', results.binary, '操作系统常用 (1KiB = 1024B)')}
          {renderUnitGroup('比特单位', results.bits, '网络带宽常用')}
        </div>
      )}

      {!value && (
        <div className="space-y-4">
          <div className="text-center py-4 text-gray-400">
            输入数值开始转换
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl text-sm">
            <p className="font-medium text-yellow-800 mb-2">💡 小知识</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• 硬盘厂商使用十进制 (1GB = 1000MB)</li>
              <li>• 操作系统使用二进制 (1GiB = 1024MiB)</li>
              <li>• 这就是为什么 1TB 硬盘显示约 931GB</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
