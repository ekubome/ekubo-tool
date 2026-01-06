import { MetadataRoute } from 'next'
import { CATEGORIES, TOOLS } from '@/lib/constants/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ekubo-tool.vercel.app'

  // 首页
  const home = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
  }

  // 分类页面
  const categories = CATEGORIES.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 工具页面
  const tools = TOOLS.map((tool) => ({
    url: `${baseUrl}/${tool.category}/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  // 静态页面
  const staticPages = [
    { url: `${baseUrl}/about`, priority: 0.5 },
    { url: `${baseUrl}/privacy`, priority: 0.3 },
    { url: `${baseUrl}/terms`, priority: 0.3 },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
  }))

  return [home, ...categories, ...tools, ...staticPages]
}
