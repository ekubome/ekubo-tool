'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Unit {
  name: string
  symbol: string
  toKg: number
}

const UNITS: Unit[] = [
  { name: '吨', symbol: 't', toKg: 1000 },
  { name: '千克', symbol: 'kg', toKg: 1 },
  { name: '克', symbol: 'g', toKg: 0.001 },
  { name: '毫克', symbol: 'mg', toKg: 0.000001 },
  { name: '微克', symbol: 'μg', toKg: 0.000000001 },
  { name: '磅', symbol: 'lb', toKg: 0.45359237 },
  { name: '盎司', symbol: 'oz', toKg: 0.028349523 },
  { name: '英石', symbol: 'st', toKg: 6.35029318 },
  { name: '斤', symbol: '斤', toKg: 0.5 },
  { name: '两', symbol: '两', toKg: 0.05 },
  { name: '钱', symbol: '钱', toKg: 0.005 },
  { name: '克拉', symbol: 'ct', toKg: 0.0002 },
  { name: '金衡盎司', symbol: 'oz t', toKg: 0.0311034768 },
]

export function WeightConverterTool() {
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('kg')
  const [copied, setCopied] = useState<string | null>(null)

  const results = useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const fromUnitData = UNITS.find(u => u.symbol === fromUnit)
    if (!fromUnitData) return null

    const kg = num * fromUnitData.toKg

    return UNITS.map(unit => ({
      ...unit,
      value: kg / unit.toKg,
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
