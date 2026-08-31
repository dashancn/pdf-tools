# 二次开发与第三方许可证说明

## 上游项目

本项目基于 **PDF Worker**（<https://github.com/fullo/pdf-worker>）二次开发。上游代码采用 MIT License；完整版权及许可文本保留在 [`LICENSE`](LICENSE) 中。本二开没有删除或替换上游作者归属，也不表示上游作者对 i41 品牌或新增功能提供背书。

## i41 二次开发内容

本版本新增或调整了：

- i41 品牌及工具生态导航
- 简体中文优先的本地化体验
- A4 发票 2 合 1 / 4 合 1 拼版工具
- `pdf.i41.cn` SEO、PWA 和 Cloudflare Pages 配置
- 移除广告与分析网络请求

上述修改与上游代码一并按仓库 `LICENSE` 的 MIT 条款分发。

## 第三方软件

本项目直接使用 Vue、Vue Router、Vite、Tailwind CSS、pdf-lib、PDF.js、DOMPurify、JSZip、FileSaver.js、QRCode、Tesseract.js 等开源组件，并包含 SCI profiler Git 子模块。它们分别采用 MIT、Apache-2.0、BSD、ISC 或其他兼容的开源许可证；具体版本以 `package-lock.json` 为准，完整许可证文本以各软件包或子模块随附的 `LICENSE` / `COPYING` 文件为准。

分发构建产物或源码时，应同时满足这些第三方许可证的版权声明、许可文本和 NOTICE 要求。此文件是归属摘要，不替代各依赖的完整许可证。
