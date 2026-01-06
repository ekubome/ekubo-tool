import { Shield, Zap, Gift, Globe, Lock, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于我们 - ekubo-tool',
  description: '了解 ekubo-tool 在线工具平台',
}

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: '隐私优先',
      description: '大部分工具在浏览器本地运行，您的文件不会上传到任何服务器，数据安全完全由您掌控。',
    },
    {
      icon: Zap,
      title: '快速高效',
      description: '无需等待上传下载，本地处理即时完成，为您节省宝贵时间。',
    },
    {
      icon: Gift,
      title: '完全免费',
      description: '所有工具免费使用，无需注册账号，无任何隐藏费用或功能限制。',
    },
    {
      icon: Globe,
      title: '跨平台',
      description: '基于 Web 技术，支持所有现代浏览器，无需安装任何软件。',
    },
    {
      icon: Lock,
      title: '安全可靠',
      description: '采用 HTTPS 加密传输，代码开源透明，您可以随时审查。',
    },
    {
      icon: Heart,
      title: '持续更新',
      description: '我们持续添加新工具，优化用户体验，欢迎提出建议。',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">关于 ekubo-tool</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            一个免费、快速、安全的在线工具集合平台，致力于为用户提供便捷的文件处理和开发工具。
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">我们的特点</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 bg-white rounded-2xl border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">技术栈</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PDF-lib', 'FFmpeg.wasm'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-white rounded-full border text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">联系我们</h2>
        <p className="text-gray-600 mb-6">
          如果您有任何问题、建议或合作意向，欢迎联系我们。
        </p>
        <p className="text-gray-500">
          Email: ekubome@163.com
        </p>
      </div>
    </div>
  )
}
