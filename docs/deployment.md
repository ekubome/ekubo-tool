# 部署文档

## Vercel 部署（推荐）

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shawyaw/ekubo-tool)

### 手动部署

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 保持默认配置，点击 "Deploy"

部署完成后会自动获得一个 `.vercel.app` 域名。

## 其他平台部署

### Netlify

```bash
# 构建命令
npm run build

# 发布目录
.next
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

需要在 `next.config.ts` 中添加：

```ts
output: 'standalone'
```

### 静态导出

如需纯静态部署（无需 Node.js 服务器）：

```ts
// next.config.ts
output: 'export'
```

```bash
npm run build
# 静态文件输出到 out/ 目录
```

## 环境变量

当前项目为纯前端应用，无需配置环境变量。

如后续添加后端功能，在 Vercel 中配置：
- Project Settings → Environment Variables

## 自定义域名

### Vercel
1. Project Settings → Domains
2. 添加域名
3. 按提示配置 DNS（CNAME 或 A 记录）

## 常见问题

**Q: 构建失败？**
- 确保 Node.js >= 18
- 删除 `node_modules` 和 `.next`，重新安装

**Q: 部署后页面空白？**
- 检查浏览器控制台错误
- 确认构建日志无报错

**Q: 如何更新？**
- 推送代码到 GitHub，Vercel 自动重新部署
