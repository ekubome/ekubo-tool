// 动态导入 pdfjs-dist，避免 SSR 问题
let pdfjsLib: typeof import('pdfjs-dist') | null = null

async function getPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js 只能在浏览器环境中使用')
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    
    // 使用 unpkg CDN，更可靠
    const version = pdfjsLib.version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  }
  
  return pdfjsLib
}

export interface PdfToMdOptions {
  preserveLineBreaks: boolean
  detectHeadings: boolean
  detectLists: boolean
}

export interface PdfToMdResult {
  markdown: string
  pageCount: number
  extractedText: string
}

// PDF.js 返回的文本项类型（简化版，兼容实际返回数据）
interface PdfTextItem {
  str: string
  dir?: string
  transform?: number[]
  width?: number
  height?: number
  fontName?: string
  hasEOL?: boolean
}

interface PageText {
  pageNum: number
  lines: TextLine[]
}

interface TextLine {
  text: string
  fontSize: number
  y: number
  isBold: boolean
}

export async function convertPdfToMarkdown(
  file: File,
  options: PdfToMdOptions,
  onProgress?: (progress: number) => void
): Promise<PdfToMdResult> {
  const pdfjs = await getPdfJs()
  
  const arrayBuffer = await file.arrayBuffer()
  
  let pdf
  try {
    pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  } catch (err) {
    throw new Error('无法解析 PDF 文件，请确保文件未损坏')
  }
  
  const pageCount = pdf.numPages
  
  if (pageCount === 0) {
    throw new Error('PDF 文件没有页面')
  }
  
  const allPages: PageText[] = []
  
  // 提取每页文本
  for (let i = 1; i <= pageCount; i++) {
    try {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // 过滤出文本项（排除标记项）并转换类型
      const textItems: PdfTextItem[] = []
      for (const item of textContent.items) {
        if ('str' in item && typeof (item as Record<string, unknown>).str === 'string') {
          const textItem = item as Record<string, unknown>
          textItems.push({
            str: textItem.str as string,
            transform: textItem.transform as number[] | undefined,
            height: textItem.height as number | undefined,
            fontName: textItem.fontName as string | undefined,
          })
        }
      }
      
      const lines = processTextContent(textItems)
      allPages.push({ pageNum: i, lines })
      
      // 更新进度
      onProgress?.((i / pageCount) * 80)
    } catch (err) {
      console.warn(`处理第 ${i} 页时出错:`, err)
      allPages.push({ pageNum: i, lines: [] })
    }
  }
  
  // 转换为 Markdown
  const markdown = convertToMarkdown(allPages, options)
  
  // 提取纯文本
  const extractedText = allPages
    .map(page => page.lines.map(line => line.text).join('\n'))
    .join('\n\n')
  
  onProgress?.(100)
  
  return {
    markdown,
    pageCount,
    extractedText
  }
}

function processTextContent(items: PdfTextItem[]): TextLine[] {
  if (items.length === 0) return []
  
  const lines: TextLine[] = []
  let currentLine: { texts: string[], fontSize: number, y: number, isBold: boolean } | null = null
  
  // 按 Y 坐标分组（同一行），Y 坐标在 transform[5]
  // transform 矩阵: [scaleX, skewX, skewY, scaleY, translateX, translateY]
  const sortedItems = [...items].sort((a, b) => {
    const yA = a.transform?.[5] ?? 0
    const yB = b.transform?.[5] ?? 0
    const yDiff = yB - yA // Y 坐标降序（PDF 坐标系 Y 轴向上）
    
    if (Math.abs(yDiff) < 5) {
      // 同一行，按 X 坐标排序
      const xA = a.transform?.[4] ?? 0
      const xB = b.transform?.[4] ?? 0
      return xA - xB
    }
    return yDiff
  })
  
  for (const item of sortedItems) {
    const text = item.str
    if (!text || !text.trim()) continue
    
    const y = Math.round(item.transform?.[5] ?? 0)
    // 字体大小通常在 transform[0] (scaleX) 或 transform[3] (scaleY)
    const fontSize = Math.abs(item.transform?.[0] ?? item.height ?? 12)
    const isBold = item.fontName?.toLowerCase().includes('bold') ?? false
    
    // 判断是否是同一行（Y 坐标差距小于 5）
    if (currentLine === null || Math.abs(currentLine.y - y) > 5) {
      // 新行：保存之前的行
      if (currentLine && currentLine.texts.length > 0) {
        lines.push({
          text: currentLine.texts.join('').trim(),
          fontSize: currentLine.fontSize,
          y: currentLine.y,
          isBold: currentLine.isBold
        })
      }
      currentLine = { texts: [text], fontSize, y, isBold }
    } else {
      // 同一行：追加文本
      // 检查是否需要添加空格（根据 X 坐标间距判断）
      currentLine.texts.push(text)
      if (isBold) currentLine.isBold = true
      if (fontSize > currentLine.fontSize) currentLine.fontSize = fontSize
    }
  }
  
  // 添加最后一行
  if (currentLine && currentLine.texts.length > 0) {
    lines.push({
      text: currentLine.texts.join('').trim(),
      fontSize: currentLine.fontSize,
      y: currentLine.y,
      isBold: currentLine.isBold
    })
  }
  
  return lines
}

function convertToMarkdown(pages: PageText[], options: PdfToMdOptions): string {
  const mdLines: string[] = []
  
  // 收集所有有效的字体大小
  const allFontSizes = pages
    .flatMap(p => p.lines.map(l => l.fontSize))
    .filter(size => size > 0)
  
  // 计算平均字体大小和中位数，用于判断标题
  const avgFontSize = allFontSizes.length > 0 
    ? allFontSizes.reduce((a, b) => a + b, 0) / allFontSizes.length 
    : 12
  
  // 计算中位数（更稳定）
  const sortedSizes = [...allFontSizes].sort((a, b) => a - b)
  const medianFontSize = sortedSizes.length > 0
    ? sortedSizes[Math.floor(sortedSizes.length / 2)]
    : 12
  
  // 使用中位数作为基准
  const baseFontSize = medianFontSize || avgFontSize || 12
  
  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const page = pages[pageIdx]
    
    // 页面分隔符（第一页不需要）
    if (pageIdx > 0 && page.lines.length > 0) {
      mdLines.push('')
      mdLines.push('---')
      mdLines.push('')
    }
    
    for (const line of page.lines) {
      let text = line.text.trim()
      if (!text) continue
      
      let isHeading = false
      
      // 检测标题（根据字体大小）
      if (options.detectHeadings && line.fontSize > 0) {
        const fontRatio = line.fontSize / baseFontSize
        
        if (fontRatio > 1.8 || (fontRatio > 1.5 && line.isBold)) {
          text = `# ${text}`
          isHeading = true
        } else if (fontRatio > 1.4 || (fontRatio > 1.2 && line.isBold)) {
          text = `## ${text}`
          isHeading = true
        } else if (fontRatio > 1.15 && line.isBold) {
          text = `### ${text}`
          isHeading = true
        }
      }
      
      // 检测列表（只对非标题文本）
      if (options.detectLists && !isHeading) {
        // 检测数字列表: "1. xxx" 或 "1、xxx" 或 "1) xxx"
        const numberedMatch = text.match(/^(\d+)[.、)]\s*(.+)$/)
        if (numberedMatch) {
          text = `${numberedMatch[1]}. ${numberedMatch[2]}`
        } else {
          // 检测无序列表: "• xxx" 或 "· xxx" 或 "- xxx" 或 "* xxx"
          const bulletMatch = text.match(/^[•·●○■□▪▫\-\*]\s*(.+)$/)
          if (bulletMatch) {
            text = `- ${bulletMatch[1]}`
          }
        }
      }
      
      mdLines.push(text)
      
      // 保留原始换行
      if (options.preserveLineBreaks) {
        mdLines.push('')
      }
    }
  }
  
  // 清理多余空行（3个以上连续空行变成2个）
  let result = mdLines.join('\n')
  result = result.replace(/\n{3,}/g, '\n\n')
  
  return result.trim()
}
