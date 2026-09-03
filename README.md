# PDF 工具箱

面向中文用户的隐私优先 PDF 工具站：<https://pdf.i41.cn>。合并、拆分、压缩、转换、编辑、OCR、签名、A4 发票拼版等操作均在浏览器本地完成，文件不会上传到业务服务器。

本仓库是 [fullo/pdf-worker](https://github.com/fullo/pdf-worker) 的二次开发版本，保留上游项目归属、历史和 MIT 许可证声明。i41 的品牌、中文本地化、A4 发票拼版和 Cloudflare Pages 配置属于本二开版本的新增内容；本项目不代表上游作者背书。

## 主要能力

- 40+ 个 PDF 工具，包括合并、拆分、压缩、旋转、水印、签名、OCR、PDF/图片/文本/Markdown 转换等
- A4 发票拼版：支持多个 PDF 按文件及页码顺序进行 2 合 1 或 4 合 1 排版
- 简体中文优先，并保留上游多语言界面
- Web Worker 本地处理，无业务后端、无文件上传
- 不加载广告；保留 Cloudflare Web Analytics，并接入 i41 匿名统计
- PWA 离线缓存与响应式界面

## 开发

```bash
npm install
npm run dev
npm test
npm run build
npm audit
```

生产构建输出到 `dist/`。Cloudflare Pages 建议配置：

- Build command: `npm run build`
- Build output directory: `dist`
- Custom domain: `pdf.i41.cn`

`public/_headers` 提供静态安全与缓存头，`public/_redirects` 提供 SPA 回退规则。项目使用 hash 路由，主要路由无需服务器重写。

## 隐私与网络

PDF 文件仍仅在浏览器内存和 Web Worker 中本地处理，应用没有业务 API 或上传接口。生产站点保留由 Cloudflare Pages 注入的 Cloudflare Web Analytics，并加载 `https://stats.i41.cn/analytics.js` 进行匿名访问、性能、UTM 与跨站点击统计。统计不包含文件、文件名、OCR 内容、用户输入或永久标识。PWA 资源由同源静态站点提供；用户主动点击 i41 生态、上游 GitHub 或 W3C 等外部链接时，浏览器会访问相应站点。

## 上游归属与许可证

- 上游项目：PDF Worker / [fullo/pdf-worker](https://github.com/fullo/pdf-worker)
- 主许可证：[MIT License](LICENSE)
- 二开及第三方说明：[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
- SCI profiler 子模块继续保留其自身仓库和许可证信息

分发本项目时必须保留 `LICENSE` 中的上游版权与许可文本，并同时遵守依赖项各自的许可证。依赖许可证可从 `package-lock.json` 对应的软件包元数据和各包随附的 LICENSE 文件核验。
