'use client'

import Link from 'next/link'
import * as Icons from 'lucide-react'
import type { ToolConfig } from '@/lib/constants/tools'

interface ToolCardProps {
  tool: ToolConfig
}

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

  return (
    <Link href={`/${tool.category}/${tool.slug}`}>
      <div className="group h-full p-5 rounded-2xl border-2 border-transparent bg-white shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
            {IconComponent && <IconComponent className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-gray-400">
          <Icons.Cpu className="w-3 h-3 mr-1" />
          {tool.isClientSide ? '本地处理' : '云端处理'}
        </div>
      </div>
    </Link>
  )
}
