import { notFound } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { ToolCard } from '@/components/tools/ToolCard'
import { getCategoryBySlug, getToolsByCategory, CATEGORIES } from '@/lib/constants/tools'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = getCategoryBySlug(categorySlug)
  
  if (!category) {
    return { title: '分类不存在' }
  }

  return {
    title: `${category.name} - ekubo-tool`,
    description: `${category.name}相关的在线工具集合`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
  }

  const tools = getToolsByCategory(categorySlug)
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
            <Icons.ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
          
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
              {IconComponent && <IconComponent className="w-10 h-10 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{category.name}</h1>
              <p className="text-gray-500">共 {tools.length} 个工具可用</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>

        {tools.length === 0 && (
          <div className="text-center py-20">
            <Icons.Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">该分类下暂无工具</p>
          </div>
        )}
      </div>
    </div>
  )
}
