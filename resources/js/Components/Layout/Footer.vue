<script setup lang="ts">
import { trans } from '@/i18n';

const currentYear = new Date().getFullYear();
</script>

<template>
    <footer class="bg-gray-900 text-gray-300">
        <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div class="flex flex-col items-center gap-3 text-center text-xs text-gray-500">
                <p class="text-sm text-gray-300">PDF 工具箱 · i41 免费实用工具 · 文件本地处理</p>

                <details class="w-full max-w-3xl rounded-lg border border-gray-800 px-4 py-2">
                    <summary class="cursor-pointer select-none font-medium text-gray-400 transition-colors hover:text-gray-200">
                        查看隐私、开源与其他说明
                    </summary>
                    <div class="mt-4 flex flex-col items-center gap-3 border-t border-gray-800 pt-4">
                        <p>所有 PDF 处理在浏览器本地完成；匿名访问、性能、UTM 与跨站点击统计不包含文件、文件名、OCR 内容、用户输入或永久标识。</p>
                        <p>基于上游开源项目 PDF Worker 二次开发 · i41 免费实用工具</p>
                        <a
                            href="https://www.w3.org/TR/web-sustainability-guidelines/"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="underline underline-offset-2 transition-colors hover:text-green-400"
                        >
                            {{ trans('footer.sustainability') }}
                        </a>
                        <div class="flex flex-wrap items-center justify-center gap-2">
                            <span>&copy; {{ currentYear }} PDF Worker. {{ trans('All rights reserved.') }}</span>
                            <span class="text-gray-700">|</span>
                            <RouterLink to="/blog" class="underline underline-offset-2 hover:text-gray-300">{{ trans('nav.blog') }}</RouterLink>
                            <span class="text-gray-700">|</span>
                            <RouterLink to="/privacy" class="underline underline-offset-2 hover:text-gray-300">{{ trans('privacy.title') }}</RouterLink>
                            <span class="text-gray-700">|</span>
                            <RouterLink to="/sci-report" class="underline underline-offset-2 hover:text-gray-300">SCI Report</RouterLink>
                            <span class="text-gray-700">|</span>
                            <RouterLink to="/sustainability" class="underline underline-offset-2 hover:text-gray-300">WSG Report</RouterLink>
                            <span class="text-gray-700">|</span>
                            <a href="https://github.com/fullo/pdf-worker/" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-gray-300">GitHub</a>
                            <span class="text-gray-700">|</span>
                            <a href="https://github.com/fullo/pdf-worker/issues" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-gray-300">{{ trans('footer.report_bug') }}</a>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </footer>
</template>
