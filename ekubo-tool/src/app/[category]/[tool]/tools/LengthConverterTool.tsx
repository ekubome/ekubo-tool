'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Unit {
  name: string
  symbol: string
  toMeter: number // 转换为米的系数
}

const UNITS: Unit[] = [
  { name: '千米', symbol: 'km', toMeter: 1000 },
  { name: '米', symbol: 'm', toMeter: 1 },
  { name: '分米', symbol: 'dm', toMeter: 0.1 },
  { name: '厘米', symbol: 'cm', toMeter: 0.01 },
  { name: '毫米', symbol: 'mm', toMeter: 0.001 },
  { name: '微米', symbol: 'μm', toMeter: 0.000001 },
  { name: '英里', symbol: 'mi', toMeter: 1609.344 },
  { name: '码', symbol: 'yd', toMeter: 0.9144 },
  { name: '英尺', symbol: 'ft', toMeter: 0.3048 },
  { name: '英寸', symbol: 'in', toMeter: 0.0254 },
  { name: '海里', symbol: 'nmi', toMeter: 1852 },
  // 中国市制单位（1市里=500米，1丈=10尺=100寸，1尺≈0.3333米）
  { name: '里', symbol: '里', toMeter: 500 },
  { name: '丈', symbol: '丈', toMeter: 10 / 3 },  // 约3.3333米
  { name: '尺', symbol: '尺', toMeter: 1 / 3 },   // 约0.3333米
  { name: '寸', symbol: '寸', toMeter: 1 / 30 },  // 约0.0333米
]

export function LengthConverterTool() {
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('m')
  const [copied, setCopied] = useState<string | null>(null)

  const results = useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const fromUnitData = UNITS.find(u => u.symbol === fromUnit)
    if (!fromUnitData) return null

    const meters = num * fromUnitData.toMeter

    return UNITS.map(unit => ({
      ...unit,
      value: meters / unit.toMeter,
    }))
  }, [value, fromUnit])

  const handleCopy = async (val: number, symbol: string) => {
    await navigator.clipboard.writeText(val.toString())
    setCopied(symbol)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatNumber = (num: number): string => {
    if (num === 0) return '0'
    if (Math.abs(num) >= 1e10 || Math.abs(num) < 1e-10) {
      return num.toExponential(6)
    }
    if (Number.isInteger(num)) return num.toString()
    return num.toPrecision(10).replace(/\.?0+$/, '')
  }

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
            className="w-full h-10 px-3 border rounded-lg text-lg"
          >
            {UNITS.map(unit => (
              <option key={unit.symbol} value={unit.symbol}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {results && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">转换结果</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {results.map(result => (
              <div
                key={result.symbol}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.symbol === fromUnit ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <span className="text-sm text-gray-500">{result.name}</span>
                  <p className="font-mono font-medium">
                    {formatNumber(result.value)} <span className="text-gray-400">{result.symbol}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.value, result.symbol)}
                >
                  {copied === result.symbol ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!value && (
        <div className="text-center py-8 text-gray-400">
          输入数值开始转换
        </div>
      )}
    </div>
  )
}
