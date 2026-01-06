import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隐私政策 - ekubo-tool',
  description: 'ekubo-tool 隐私政策',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最后更新日期：2026年1月5日
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. 概述</h2>
            <p className="text-gray-600 mb-4">
              ekubo-tool 非常重视您的隐私。本隐私政策说明了我们如何收集、使用和保护您的信息。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 数据处理</h2>
            <p className="text-gray-600 mb-4">
              我们的大部分工具在您的浏览器中本地运行，这意味着：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>您上传的文件不会发送到我们的服务器</li>
              <li>所有文件处理都在您的设备上完成</li>
              <li>处理完成后，文件数据不会被保留</li>
              <li>我们无法访问您处理的任何文件内容</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 我们收集的信息</h2>
            <p className="text-gray-600 mb-4">
              我们可能收集以下匿名信息用于改进服务：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>工具使用统计（哪些工具被使用最多）</li>
              <li>基本的访问日志（IP 地址、浏览器类型）</li>
              <li>错误报告（帮助我们修复问题）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Cookie 使用</h2>
            <p className="text-gray-600 mb-4">
              我们使用必要的 Cookie 来确保网站正常运行。这些 Cookie 不会用于跟踪您的个人信息。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. 第三方服务</h2>
            <p className="text-gray-600 mb-4">
              我们可能使用第三方分析服务来了解网站使用情况。这些服务有自己的隐私政策。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. 数据安全</h2>
            <p className="text-gray-600 mb-4">
              我们采取适当的技术措施保护您的数据安全，包括使用 HTTPS 加密所有通信。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. 联系我们</h2>
            <p className="text-gray-600 mb-4">
              ekubome@163.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
