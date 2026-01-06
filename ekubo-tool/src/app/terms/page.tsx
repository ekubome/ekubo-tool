'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">使用条款</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">使用条款</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最后更新日期：2025年1月
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 服务说明</h2>
            <p className="text-gray-600 mb-4">
              ekubo-tool 是一个免费的在线工具集合平台，提供 PDF 处理、图片压缩、开发工具等多种实用工具。
              我们的大部分工具在您的浏览器本地运行，不会将您的文件上传到服务器。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 使用规则</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>您同意仅将本服务用于合法目的</li>
              <li>您不得使用本服务处理任何非法、有害或侵权的内容</li>
              <li>您不得尝试破坏、干扰或滥用本服务</li>
              <li>您对使用本服务处理的所有文件和内容负责</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 免责声明</h2>
            <p className="text-gray-600 mb-4">
              本服务按"现状"提供，不提供任何明示或暗示的保证。我们不保证服务的准确性、可靠性或适用性。
              对于因使用本服务而导致的任何直接或间接损失，我们不承担责任。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 知识产权</h2>
            <p className="text-gray-600 mb-4">
              本网站的设计、代码和内容受知识产权法保护。您使用本服务处理的文件的知识产权归您所有。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 条款修改</h2>
            <p className="text-gray-600 mb-4">
              我们保留随时修改这些条款的权利。修改后的条款将在本页面发布后立即生效。
              继续使用本服务即表示您接受修改后的条款。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 联系我们</h2>
            <p className="text-gray-600">
              如果您对这些条款有任何疑问，请通过 GitHub/邮箱 与我们联系。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
