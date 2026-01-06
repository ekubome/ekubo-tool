export interface ToolOption {
  key: string
  type: 'select' | 'number' | 'boolean' | 'text'
  label: string
  description?: string
  default: string | number | boolean
  options?: { value: string; label: string }[]
  min?: number
  max?: number
}

export interface ToolConfig {
  slug: string
  name: string
  description: string
  category: string
  icon: string
  isClientSide: boolean
  maxFileSize: number
  acceptedTypes: string[]
  multiple?: boolean
  options?: ToolOption[]
}

export interface CategoryConfig {
  slug: string
  name: string
  icon: string
  order: number
}

export const CATEGORIES: CategoryConfig[] = [
  { slug: 'pdf', name: '文档处理', icon: 'FileText', order: 1 },
  { slug: 'image', name: '图片工具', icon: 'Image', order: 2 },
  { slug: 'text', name: '文本工具', icon: 'Type', order: 3 },
  { slug: 'dev', name: '开发工具', icon: 'Code', order: 4 },
  { slug: 'crypto', name: '加密工具', icon: 'Lock', order: 5 },
  { slug: 'converter', name: '单位换算', icon: 'ArrowLeftRight', order: 6 },
]


export const TOOLS: ToolConfig[] = [
  // PDF 工具
  {
    slug: 'pdf-compress',
    name: 'PDF 压缩',
    description: '智能压缩 PDF 文件，保持清晰度的同时大幅减小文件体积',
    category: 'pdf',
    icon: 'FileDown',
    isClientSide: true,
    maxFileSize: 100 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
    options: [
      {
        key: 'quality',
        type: 'select',
        label: '压缩质量',
        default: 'medium',
        options: [
          { value: 'low', label: '高压缩 (文件最小)' },
          { value: 'medium', label: '平衡 (推荐)' },
          { value: 'high', label: '高质量 (文件较大)' },
        ],
      },
    ],
  },
  {
    slug: 'pdf-merge',
    name: 'PDF 合并',
    description: '将多个 PDF 文件合并为一个文件',
    category: 'pdf',
    icon: 'FilePlus2',
    isClientSide: true,
    maxFileSize: 50 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
    multiple: true,
  },
  {
    slug: 'pdf-split',
    name: 'PDF 拆分',
    description: '将 PDF 文件拆分成多个独立文件',
    category: 'pdf',
    icon: 'Scissors',
    isClientSide: true,
    maxFileSize: 100 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
  },
  {
    slug: 'pdf-extract',
    name: 'PDF 页面提取',
    description: '从 PDF 中提取指定页面',
    category: 'pdf',
    icon: 'FileOutput',
    isClientSide: true,
    maxFileSize: 100 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
  },
  {
    slug: 'pdf-rotate',
    name: 'PDF 旋转',
    description: '旋转 PDF 页面方向',
    category: 'pdf',
    icon: 'RotateCw',
    isClientSide: true,
    maxFileSize: 100 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
  },
  {
    slug: 'pdf-watermark',
    name: 'PDF 水印',
    description: '给 PDF 添加文字水印',
    category: 'pdf',
    icon: 'Stamp',
    isClientSide: true,
    maxFileSize: 50 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
  },
  {
    slug: 'pdf-reorder',
    name: 'PDF 页面重排',
    description: '调整 PDF 页面顺序，删除不需要的页面',
    category: 'pdf',
    icon: 'ListOrdered',
    isClientSide: true,
    maxFileSize: 100 * 1024 * 1024,
    acceptedTypes: ['.pdf', 'application/pdf'],
  },
  {
    slug: 'image-to-pdf',
    name: '图片转 PDF',
    description: '将多张图片合并转换为 PDF 文件',
    category: 'pdf',
    icon: 'FileImage',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
  },
  // 图片工具
  {
    slug: 'image-crop',
    name: '图片裁剪',
    description: '裁剪图片指定区域，支持自由裁剪和固定比例',
    category: 'image',
    icon: 'Crop',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
  },
  {
    slug: 'image-watermark',
    name: '图片加水印',
    description: '给图片添加文字或图片水印',
    category: 'image',
    icon: 'Stamp',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
  },
  {
    slug: 'image-rotate',
    name: '图片旋转翻转',
    description: '旋转或镜像翻转图片',
    category: 'image',
    icon: 'RotateCw',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
  },
  {
    slug: 'image-merge',
    name: '图片拼接',
    description: '多张图片横向或纵向拼接',
    category: 'image',
    icon: 'LayoutGrid',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
  },
  {
    slug: 'image-compress',
    name: '图片压缩',
    description: '压缩图片文件大小，支持 JPG、PNG、WebP 格式',
    category: 'image',
    icon: 'ImageDown',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
    options: [
      {
        key: 'quality',
        type: 'number',
        label: '压缩质量',
        description: '1-100，数值越大质量越高',
        default: 80,
        min: 1,
        max: 100,
      },
    ],
  },
  {
    slug: 'image-convert',
    name: '图片格式转换',
    description: '转换图片格式，支持 JPG、PNG、WebP 互转',
    category: 'image',
    icon: 'ImagePlus',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
    options: [
      {
        key: 'format',
        type: 'select',
        label: '输出格式',
        default: 'webp',
        options: [
          { value: 'jpeg', label: 'JPEG' },
          { value: 'png', label: 'PNG' },
          { value: 'webp', label: 'WebP' },
        ],
      },
    ],
  },
  {
    slug: 'image-resize',
    name: '图片调整大小',
    description: '调整图片尺寸，支持自定义宽高',
    category: 'image',
    icon: 'Maximize2',
    isClientSide: true,
    maxFileSize: 20 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: true,
  },
  // 文本工具
  {
    slug: 'text-dedupe',
    name: '文本去重',
    description: '去除文本中的重复行',
    category: 'text',
    icon: 'ListX',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'text-sort',
    name: '文本排序',
    description: '按行对文本进行排序',
    category: 'text',
    icon: 'ArrowUpDown',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'text-case',
    name: '大小写转换',
    description: '转换文本大小写，支持多种格式',
    category: 'text',
    icon: 'CaseSensitive',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'text-trim',
    name: '空白处理',
    description: '去除多余空格、空行，处理空白字符',
    category: 'text',
    icon: 'RemoveFormatting',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化和美化 JSON 数据，支持压缩和校验',
    category: 'text',
    icon: 'Braces',
    isClientSide: true,
    maxFileSize: 5 * 1024 * 1024,
    acceptedTypes: [],
  },
  {
    slug: 'text-diff',
    name: '文本对比',
    description: '对比两段文本的差异，高亮显示不同之处',
    category: 'text',
    icon: 'GitCompare',
    isClientSide: true,
    maxFileSize: 1 * 1024 * 1024,
    acceptedTypes: [],
  },
  {
    slug: 'word-count',
    name: '字数统计',
    description: '统计文本字数、字符数、行数、阅读时间',
    category: 'text',
    icon: 'FileText',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown 预览',
    description: '实时预览 Markdown 文档',
    category: 'text',
    icon: 'FileCode',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  // 开发工具
  {
    slug: 'base64',
    name: 'Base64 编解码',
    description: 'Base64 编码和解码工具',
    category: 'dev',
    icon: 'Binary',
    isClientSide: true,
    maxFileSize: 5 * 1024 * 1024,
    acceptedTypes: [],
  },
  {
    slug: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期时间互转',
    category: 'dev',
    icon: 'Clock',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'qrcode',
    name: '二维码生成',
    description: '生成二维码图片',
    category: 'dev',
    icon: 'QrCode',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'qrcode-reader',
    name: '二维码识别',
    description: '识别图片中的二维码内容',
    category: 'dev',
    icon: 'ScanLine',
    isClientSide: true,
    maxFileSize: 10 * 1024 * 1024,
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT 解析',
    description: '解析和验证 JWT Token',
    category: 'dev',
    icon: 'KeySquare',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'json-to-csv',
    name: 'JSON 转 CSV',
    description: '将 JSON 数据转换为 CSV 格式',
    category: 'dev',
    icon: 'FileSpreadsheet',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'json-to-yaml',
    name: 'JSON 转 YAML',
    description: 'JSON 与 YAML 格式互转',
    category: 'dev',
    icon: 'FileJson',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'uuid',
    name: 'UUID 生成',
    description: '生成随机 UUID',
    category: 'dev',
    icon: 'Fingerprint',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'color-converter',
    name: '颜色转换',
    description: 'HEX、RGB、HSL 颜色格式互转',
    category: 'dev',
    icon: 'Palette',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'url-encode',
    name: 'URL 编解码',
    description: 'URL 编码和解码工具',
    category: 'dev',
    icon: 'Link',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'regex-tester',
    name: '正则测试',
    description: '在线测试正则表达式，实时匹配高亮',
    category: 'dev',
    icon: 'Regex',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  // 加密工具
  {
    slug: 'aes-encrypt',
    name: 'AES 加密解密',
    description: 'AES 对称加密和解密工具',
    category: 'crypto',
    icon: 'ShieldCheck',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'hash',
    name: '哈希计算',
    description: '计算 MD5、SHA1、SHA256 哈希值',
    category: 'crypto',
    icon: 'Hash',
    isClientSide: true,
    maxFileSize: 100 * 1024 * 1024,
    acceptedTypes: [],
  },
  {
    slug: 'password-generator',
    name: '密码生成',
    description: '生成安全的随机密码',
    category: 'crypto',
    icon: 'KeyRound',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  // 单位换算
  {
    slug: 'length-converter',
    name: '长度单位换算',
    description: '米、厘米、英尺、英寸等长度单位互转',
    category: 'converter',
    icon: 'Ruler',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'weight-converter',
    name: '重量单位换算',
    description: '千克、磅、盎司等重量单位互转',
    category: 'converter',
    icon: 'Scale',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'temperature-converter',
    name: '温度单位换算',
    description: '摄氏度、华氏度、开尔文互转',
    category: 'converter',
    icon: 'Thermometer',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'storage-converter',
    name: '存储单位换算',
    description: 'B、KB、MB、GB、TB 等存储单位互转',
    category: 'converter',
    icon: 'HardDrive',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
  {
    slug: 'number-base',
    name: '进制转换',
    description: '二进制、八进制、十进制、十六进制互转',
    category: 'converter',
    icon: 'Calculator',
    isClientSide: true,
    maxFileSize: 0,
    acceptedTypes: [],
  },
]

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return TOOLS.find(t => t.slug === slug)
}

export function getToolsByCategory(category: string): ToolConfig[] {
  return TOOLS.filter(t => t.category === category)
}

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find(c => c.slug === slug)
}
