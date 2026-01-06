import Link from 'next/link'
import { Wrench, Heart } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants/tools'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">ekubo-tool</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              免费、快速、安全的在线工具集合。您的数据安全是我们的首要任务。
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">工具分类</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 4).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="font-semibold text-white mb-4">热门工具</h3>
            <ul className="space-y-2">
              <li><Link href="/pdf/pdf-merge" className="text-sm text-gray-400 hover:text-white transition-colors">PDF 合并</Link></li>
              <li><Link href="/image/image-compress" className="text-sm text-gray-400 hover:text-white transition-colors">图片压缩</Link></li>
              <li><Link href="/dev/qrcode" className="text-sm text-gray-400 hover:text-white transition-colors">二维码生成</Link></li>
              <li><Link href="/text/json-formatter" className="text-sm text-gray-400 hover:text-white transition-colors">JSON 格式化</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-white mb-4">关于</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">关于我们</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">隐私政策</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">使用条款</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ekubo-tool. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> for everyone
          </p>
        </div>
      </div>
    </footer>
  )
}
