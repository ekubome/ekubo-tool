import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolCard } from '@/components/tools/ToolCard'
import { ToolSearch } from '@/components/tools/ToolSearch'
import { CATEGORIES, TOOLS } from '@/lib/constants/tools'

export default function HomePage() {
  const popularTools = TOOLS.slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-28">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Icons.Sparkles className="w-4 h-4" />
              完全免费 · 无需注册 · 隐私安全
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
              在线工具，触手可及
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              免费、快速、安全的在线工具集合。
              <br className="hidden md:block" />
              文件处理在浏览器本地完成，保护您的隐私。
            </p>
            
            {/* 搜索框 */}
            <div className="mb-8">
              <ToolSearch />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow">
                <Link href="#tools">
                  <Icons.Rocket className="w-5 h-5 mr-2" />
                  开始使用
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/80 backdrop-blur">
                <Link href="/pdf">
                  <Icons.FolderOpen className="w-5 h-5 mr-2" />
                  浏览工具
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Categories */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">工具分类</h2>
            <p className="text-gray-500">选择你需要的工具类型</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => {
              const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>
              return (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="group flex flex-col items-center p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm hover:shadow-lg hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transition-all duration-300"
                >
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                    {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{category.name}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Popular Tools */}
        <section id="tools" className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">热门工具</h2>
            <p className="text-gray-500">最常用的在线工具</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 -mx-4 px-4 rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">为什么选择我们</h2>
            <p className="text-gray-500">简单、安全、高效</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/20">
                <Icons.Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">隐私安全</h3>
              <p className="text-gray-500 text-sm leading-relaxed">文件在浏览器本地处理，不上传服务器，您的数据完全由您掌控</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
                <Icons.Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">快速高效</h3>
              <p className="text-gray-500 text-sm leading-relaxed">无需等待上传下载，即时处理，节省您的宝贵时间</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20">
                <Icons.Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">完全免费</h3>
              <p className="text-gray-500 text-sm leading-relaxed">所有工具免费使用，无需注册，无任何隐藏费用</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
