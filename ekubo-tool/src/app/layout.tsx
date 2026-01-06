import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekubo-tool.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ekubo-tool - 免费在线工具聚合平台',
    template: '%s | ekubo-tool',
  },
  description: '免费在线工具集合，包含 PDF 处理、图片压缩、格式转换、文本处理、开发工具、加密工具、单位换算等 40+ 实用工具。所有文件本地处理，保护隐私安全。',
  keywords: [
    '在线工具', '免费工具', 'PDF压缩', 'PDF合并', '图片压缩', '图片格式转换',
    'JSON格式化', 'Base64编码', '二维码生成', '时间戳转换', '哈希计算',
    '密码生成器', '单位换算', '文本对比', '正则测试', 'JWT解码',
  ],
  authors: [{ name: 'ekubo-tool' }],
  creator: 'ekubo-tool',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: baseUrl,
    siteName: 'ekubo-tool',
    title: 'ekubo-tool - 免费在线工具聚合平台',
    description: '免费在线工具集合，PDF处理、图片编辑、开发工具等 40+ 实用工具，本地处理保护隐私。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ekubo-tool - 免费在线工具聚合平台',
    description: '免费在线工具集合，PDF处理、图片编辑、开发工具等 40+ 实用工具。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'sGWHJHutxVI-SztdyI6jw8DYZixJoKY_35uordU94KA',
  },
  other: {
    'msvalidate.01': 'CC541832F6C1F0CB09C5D8F5ACAD6FD8',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
