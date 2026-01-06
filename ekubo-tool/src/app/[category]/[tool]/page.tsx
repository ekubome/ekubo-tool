import { notFound } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { getToolBySlug, getCategoryBySlug, TOOLS } from '@/lib/constants/tools'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import type { Metadata } from 'next'

// Tool Components
import { ImageCompressTool } from './tools/ImageCompressTool'
import { ImageConvertTool } from './tools/ImageConvertTool'
import { ImageResizeTool } from './tools/ImageResizeTool'
import { ImageCropTool } from './tools/ImageCropTool'
import { ImageWatermarkTool } from './tools/ImageWatermarkTool'
import { ImageRotateTool } from './tools/ImageRotateTool'
import { ImageMergeTool } from './tools/ImageMergeTool'
import { JsonFormatterTool } from './tools/JsonFormatterTool'
import { Base64Tool } from './tools/Base64Tool'
import { TimestampTool } from './tools/TimestampTool'
import { QRCodeTool } from './tools/QRCodeTool'
import { QRCodeReaderTool } from './tools/QRCodeReaderTool'
import { UUIDTool } from './tools/UUIDTool'
import { ColorConverterTool } from './tools/ColorConverterTool'
import { HashTool } from './tools/HashTool'
import { PasswordGeneratorTool } from './tools/PasswordGeneratorTool'
import { NumberBaseTool } from './tools/NumberBaseTool'
import { PDFMergeTool } from './tools/PDFMergeTool'
import { PDFCompressTool } from './tools/PDFCompressTool'
import { PDFSplitTool } from './tools/PDFSplitTool'
import { PDFExtractTool } from './tools/PDFExtractTool'
import { PDFRotateTool } from './tools/PDFRotateTool'
import { PDFWatermarkTool } from './tools/PDFWatermarkTool'
import { PDFReorderTool } from './tools/PDFReorderTool'
import { ImageToPDFTool } from './tools/ImageToPDFTool'
import { TextDiffTool } from './tools/TextDiffTool'
import { TextDedupeTool } from './tools/TextDedupeTool'
import { TextSortTool } from './tools/TextSortTool'
import { TextCaseTool } from './tools/TextCaseTool'
import { TextTrimTool } from './tools/TextTrimTool'
import { WordCountTool } from './tools/WordCountTool'
import { UrlEncodeTool } from './tools/UrlEncodeTool'
import { RegexTesterTool } from './tools/RegexTesterTool'
import { MarkdownPreviewTool } from './tools/MarkdownPreviewTool'
import { JwtDecoderTool } from './tools/JwtDecoderTool'
import { JsonToCsvTool } from './tools/JsonToCsvTool'
import { JsonToYamlTool } from './tools/JsonToYamlTool'
import { AesEncryptTool } from './tools/AesEncryptTool'
import { LengthConverterTool } from './tools/LengthConverterTool'
import { WeightConverterTool } from './tools/WeightConverterTool'
import { TemperatureConverterTool } from './tools/TemperatureConverterTool'
import { StorageConverterTool } from './tools/StorageConverterTool'

interface ToolPageProps {
  params: Promise<{ category: string; tool: string }>
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    category: tool.category,
    tool: tool.slug,
  }))
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { tool: toolSlug } = await params
  const tool = getToolBySlug(toolSlug)

  if (!tool) {
    return { title: '工具不存在' }
  }

  return {
    title: `${tool.name} - 在线免费工具 | ekubo-tool`,
    description: tool.description,
  }
}

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  // 图片工具
  'image-crop': ImageCropTool,
  'image-watermark': ImageWatermarkTool,
  'image-rotate': ImageRotateTool,
  'image-merge': ImageMergeTool,
  'image-compress': ImageCompressTool,
  'image-convert': ImageConvertTool,
  'image-resize': ImageResizeTool,
  // 文本工具
  'text-dedupe': TextDedupeTool,
  'text-sort': TextSortTool,
  'text-case': TextCaseTool,
  'text-trim': TextTrimTool,
  'json-formatter': JsonFormatterTool,
  'text-diff': TextDiffTool,
  'word-count': WordCountTool,
  'markdown-preview': MarkdownPreviewTool,
  // 开发工具
  'base64': Base64Tool,
  'timestamp': TimestampTool,
  'qrcode': QRCodeTool,
  'qrcode-reader': QRCodeReaderTool,
  'jwt-decoder': JwtDecoderTool,
  'json-to-csv': JsonToCsvTool,
  'json-to-yaml': JsonToYamlTool,
  'uuid': UUIDTool,
  'color-converter': ColorConverterTool,
  'url-encode': UrlEncodeTool,
  'regex-tester': RegexTesterTool,
  // 加密工具
  'aes-encrypt': AesEncryptTool,
  'hash': HashTool,
  'password-generator': PasswordGeneratorTool,
  // 单位换算
  'length-converter': LengthConverterTool,
  'weight-converter': WeightConverterTool,
  'temperature-converter': TemperatureConverterTool,
  'storage-converter': StorageConverterTool,
  'number-base': NumberBaseTool,
  // PDF 工具
  'pdf-merge': PDFMergeTool,
  'pdf-compress': PDFCompressTool,
  'pdf-split': PDFSplitTool,
  'pdf-extract': PDFExtractTool,
  'pdf-rotate': PDFRotateTool,
  'pdf-watermark': PDFWatermarkTool,
  'pdf-reorder': PDFReorderTool,
  'image-to-pdf': ImageToPDFTool,
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { category: categorySlug, tool: toolSlug } = await params
  const tool = getToolBySlug(toolSlug)
  const category = getCategoryBySlug(categorySlug)

  if (!tool || !category || tool.category !== categorySlug) {
    notFound()
  }

  const ToolComponent = TOOL_COMPONENTS[toolSlug]
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
            <Icons.ChevronRight className="w-4 h-4" />
            <Link href={`/${categorySlug}`} className="hover:text-blue-600 transition-colors">{category.name}</Link>
            <Icons.ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{tool.name}</span>
          </nav>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{tool.name}</h1>
              <p className="text-gray-500">{tool.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Icons.Cpu className="w-3 h-3" />
                  {tool.isClientSide ? '本地处理，数据不上传' : '云端处理'}
                </span>
                {tool.maxFileSize > 0 && (
                  <span className="flex items-center gap-1">
                    <Icons.HardDrive className="w-3 h-3" />
                    最大 {Math.round(tool.maxFileSize / 1024 / 1024)}MB
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          {ToolComponent ? (
            <ErrorBoundary>
              <ToolComponent />
            </ErrorBoundary>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Wrench className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">工具开发中</h3>
              <p className="text-gray-500">该工具正在开发中，敬请期待...</p>
            </div>
          )}
        </div>

        {/* Tips */}
        {tool.isClientSide && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <Icons.ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">隐私保护</p>
              <p className="text-sm text-green-600">您的文件仅在浏览器本地处理，不会上传到任何服务器。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
