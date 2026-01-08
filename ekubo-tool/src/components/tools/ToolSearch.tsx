'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import { TOOLS } from '@/lib/constants/tools'
import { cn } from '@/lib/utils'

export function ToolSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return TOOLS.filter(
      tool =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, Math.max(0, results.length - 1)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      // 只有当有搜索结果且选中的索引有效时才导航
      if (results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
        router.push(`/${results[selectedIndex].category}/${results[selectedIndex].slug}`)
        setQuery('')
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setQuery('')
      setIsOpen(false)
    }
  }

  const handleSelect = (tool: typeof TOOLS[0]) => {
    router.push(`/${tool.category}/${tool.slug}`)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜索工具，如：PDF 压缩、图片转换..."
          className="w-full h-12 pl-12 pr-10 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-lg overflow-hidden z-50">
          {results.map((tool, index) => {
            const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>
            return (
              <button
                key={tool.slug}
                onClick={() => handleSelect(tool)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left transition-colors",
                  index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                )}
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  {IconComponent && <IconComponent className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{tool.name}</p>
                  <p className="text-sm text-gray-500 truncate">{tool.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-lg p-4 text-center text-gray-500 z-50">
          未找到相关工具
        </div>
      )}
    </div>
  )
}
