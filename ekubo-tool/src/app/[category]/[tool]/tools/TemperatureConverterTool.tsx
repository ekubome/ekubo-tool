'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TempUnit = 'celsius' | 'fahrenheit' | 'kelvin'

interface TempResult {
  unit: TempUnit
  name: string
  symbol: string
  value: number
}

export function TemperatureConverterTool() {
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState<TempUnit>('celsius')
  const [copied, setCopied] = useState<string | null>(null)

  const results = useMemo((): TempResult[] | null => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    // 先转换为摄氏度
    let celsius: number
    switch (fromUnit) {
      case 'celsius':
        celsius = num
        break
      case 'fahrenheit':
        celsius = (num - 32) * 5 / 9
        break
      case 'kelvin':
        celsius = num - 273.15
        break
    }

    return [
      { unit: 'celsius', name: '摄氏度', symbol: '°C', value: celsius },
      { unit: 'fahrenheit', name: '华氏度', symbol: '°F', value: celsius * 9 / 5 + 32 },
      { unit: 'kelvin', name: '开尔文', symbol: 'K', value: celsius + 273.15 },
    ]
  }, [value, fromUnit])

  const handleCopy = async (val: number, unit: string) => {
    await navigator.clipboard.writeText(val.toFixed(2))
    setCopied(unit)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatNumber = (num: number): string => {
    return num.toFixed(2)
  }

  const getTemperatureColor = (celsius: number): string => {
    if (celsius < 0) return 'text-blue-600'
    if (celsius < 15) return 'text-cyan-600'
    if (celsius < 25) return 'text-green-600'
    if (celsius < 35) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTemperatureDescription = (celsius: number): string => {
    if (celsius < -20) return '极寒'
    if (celsius < 0) return '严寒'
    if (celsius < 10) return '寒冷'
    if (celsius < 20) return '凉爽'
    if (celsius < 28) return '舒适'
    if (celsius < 35) return '炎热'
    if (celsius < 40) return '酷热'
    return '极热'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">输入温度</label>
          <Input
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="输入温度值"
            className="text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">单位</label>
          <select
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value as TempUnit)}
            className="w-full h-10 px-3 border rounded-lg text-lg"
          >
            <option value="celsius">摄氏度 (°C)</option>
            <option value="fahrenheit">华氏度 (°F)</option>
            <option value="kelvin">开尔文 (K)</option>
          </select>
        </div>
      </div>

      {results && (
        <div className="space-y-4">
          {/* 温度描述 */}
          <div className={`p-4 rounded-xl bg-gradient-to-r ${
            results[0].value < 0 ? 'from-blue-50 to-cyan-50' :
            results[0].value < 25 ? 'from-green-50 to-emerald-50' :
            'from-orange-50 to-red-50'
          }`}>
            <p className={`text-3xl font-bold ${getTemperatureColor(results[0].value)}`}>
              {getTemperatureDescription(results[0].value)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {results[0].value.toFixed(1)}°C
            </p>
          </div>

          {/* 转换结果 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">转换结果</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {results.map(result => (
                <div
                  key={result.unit}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    result.unit === fromUnit ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <span className="text-sm text-gray-500">{result.name}</span>
                    <p className="font-mono text-xl font-bold">
                      {formatNumber(result.value)}
                      <span className="text-gray-400 text-base ml-1">{result.symbol}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.value, result.unit)}
                  >
                    {copied === result.unit ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 常用参考 */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium mb-2">常用参考温度</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-blue-600 font-medium">水的冰点</p>
                <p className="text-gray-500">0°C / 32°F</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-green-600 font-medium">室温</p>
                <p className="text-gray-500">20-25°C</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-orange-600 font-medium">体温</p>
                <p className="text-gray-500">37°C / 98.6°F</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-red-600 font-medium">水的沸点</p>
                <p className="text-gray-500">100°C / 212°F</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!value && (
        <div className="text-center py-8 text-gray-400">
          输入温度值开始转换
        </div>
      )}
    </div>
  )
}
