# ekubo-tool

一个现代化的在线工具聚合平台，提供 PDF 处理、图片编辑、文本工具、开发工具等多种实用功能。所有文件处理均在浏览器本地完成，保护用户隐私。

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 特性

- 🔒 **隐私安全** - 所有文件处理在浏览器本地完成，不上传服务器
- ⚡ **快速高效** - 无需等待上传下载，即时处理
- 🎨 **现代 UI** - 基于 Tailwind CSS 的精美界面设计
- 📱 **响应式** - 完美支持桌面端和移动端
- 🆓 **完全免费** - 所有工具免费使用，无需注册

## 🛠️ 工具列表

### 📄 PDF 工具
| 工具 | 描述 |
|------|------|
| PDF 压缩 | 智能压缩 PDF 文件，保持清晰度 |
| PDF 合并 | 将多个 PDF 文件合并为一个 |
| PDF 拆分 | 将 PDF 拆分成多个独立文件 |
| PDF 页面提取 | 从 PDF 中提取指定页面 |
| PDF 旋转 | 旋转 PDF 页面方向 |
| PDF 水印 | 给 PDF 添加文字水印 |
| PDF 页面重排 | 调整 PDF 页面顺序 |
| 图片转 PDF | 将多张图片合并转换为 PDF |

### 🖼️ 图片工具
| 工具 | 描述 |
|------|------|
| 图片压缩 | 压缩图片文件大小，支持 JPG/PNG/WebP |
| 图片格式转换 | JPG、PNG、WebP 格式互转 |
| 图片调整大小 | 自定义图片尺寸 |

### 📝 文本工具
| 工具 | 描述 |
|------|------|
| JSON 格式化 | 格式化和美化 JSON 数据 |
| 文本对比 | 对比两段文本的差异 |
| 字数统计 | 统计字数、字符数、行数、阅读时间 |
| Markdown 预览 | 实时预览 Markdown 文档 |

### 💻 开发工具
| 工具 | 描述 |
|------|------|
| Base64 编解码 | Base64 编码和解码 |
| 时间戳转换 | 时间戳与日期时间互转 |
| 二维码生成 | 生成二维码图片 |
| UUID 生成 | 生成随机 UUID |
| 颜色转换 | HEX、RGB、HSL 格式互转 |
| URL 编解码 | URL 编码和解码 |
| 正则测试 | 在线测试正则表达式 |

### 🔐 加密工具
| 工具 | 描述 |
|------|------|
| 哈希计算 | 计算 MD5、SHA1、SHA256、SHA512 |
| 密码生成 | 生成安全的随机密码 |

### 🔢 单位换算
| 工具 | 描述 |
|------|------|
| 进制转换 | 二进制、八进制、十进制、十六进制互转 |

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/shawyaw/ekubo-tool.git

# 进入项目目录
cd ekubo-tool

# 安装依赖
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 🏗️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) - React 全栈框架
- **前端**: [React 19](https://react.dev/) - 用户界面库
- **语言**: [TypeScript 5](https://www.typescriptlang.org/) - 类型安全
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/) - 原子化 CSS
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/) - 轻量级状态管理
- **PDF 处理**: [pdf-lib](https://pdf-lib.js.org/) - PDF 操作库
- **图片压缩**: [browser-image-compression](https://github.com/nicolo-ribaudo/browser-image-compression) - 浏览器端图片压缩
- **二维码**: [qrcode](https://github.com/soldair/node-qrcode) - 二维码生成
- **加密**: [crypto-js](https://github.com/brix/crypto-js) - 加密算法库
- **UI 组件**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)

## 📁 项目结构

```
ekubo-tool/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [category]/         # 分类页面
│   │   │   └── [tool]/         # 工具页面
│   │   │       └── tools/      # 工具组件
│   │   ├── about/              # 关于页面
│   │   ├── privacy/            # 隐私政策
│   │   └── terms/              # 使用条款
│   ├── components/
│   │   ├── layout/             # 布局组件
│   │   ├── tools/              # 工具通用组件
│   │   └── ui/                 # UI 基础组件
│   └── lib/
│       ├── constants/          # 常量配置
│       ├── hooks/              # 自定义 Hooks
│       ├── tools/              # 工具函数库
│       └── utils.ts            # 通用工具函数
├── public/                     # 静态资源
└── package.json
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pdf-lib](https://pdf-lib.js.org/)
- [Lucide Icons](https://lucide.dev/)

---

如果这个项目对你有帮助，请给一个 ⭐ Star！
