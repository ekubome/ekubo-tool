'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, getToolsByCategory } from '@/lib/constants/tools'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-gray-50/50 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-6">
        {CATEGORIES.map((category) => {
          const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>
          const tools = getToolsByCategory(category.slug)

          return (
            <div key={category.slug}>
              <Link
                href={`/${category.slug}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === `/${category.slug}`
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                {category.name}
              </Link>
              <ul className="mt-1 ml-4 space-y-1">
                {tools.slice(0, 5).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/${category.slug}/${tool.slug}`}
                      className={cn(
                        "block px-3 py-1.5 rounded text-sm transition-colors",
                        pathname === `/${category.slug}/${tool.slug}`
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
